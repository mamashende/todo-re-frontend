import  { useState,useEffect } from 'react';
import  Button  from '@mui/material/Button';
import  TextField  from '@mui/material/TextField';
import Box from '@mui/material/Box'
import axios from 'axios';
interface Todo {
  id: number;
  title: string;
  content:string;
  status: boolean;
}
const apiClient = axios.create({
  baseURL: 'https://kong-67ac8ef84auskur8e.kongcloud.dev', // 替换为你的后端地址
  headers: {
    'Content-Type': 'application/json'
  }
});

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [inputTitle,setInputTitle] = useState<string>('');
  const [inputContent,setInputContent] = useState<string>('');
  useEffect(() => {
    getTodo();
  }, []);

  const getTodo = () => {
    
    apiClient.get('/todos')
      .then(function (response) {
        // handle success
        console.log(response);
        setTodos(response.data.todos);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }
  const addTodo = () => {
    if (inputTitle.trim() !== '' && inputContent.trim() !== '') {
      setTodos([...todos, { id: Date.now(), title: inputTitle,content:inputContent, status: false }]);
      apiClient.post('/todos', { todo_title: inputTitle,todo_content:inputContent, status: false })
      .then(function (response) {
        // handle success
        console.log(response);
        setTodos([...todos, { id: response.data.id, title: inputTitle, content: inputContent, status: false }]);
      })
      setInputTitle('');
      setInputContent('');
    }
  };

  const deleteTodo = (targetId: number) => {
    setTodos(todos.filter(todo => todo.id !== targetId));
    apiClient.delete('/todos', { data: { id: targetId } })
     .then(function (response) {
        // handle success
        console.log(response);
      })
     .catch(function (error) {
        // handle error
        console.log(error);
      })
     .finally(function () {
        // always executed
      });
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, status: !todo.status } : todo
    ));
    const newtodo = todos.find(todo => todo.id === id)
    apiClient.put(`/todos`, { id,status:!todos.find(todo => todo.id === id)?.status ,todo_title : newtodo?.title,todo_content:newtodo?.content})
  };

  const updateTodo = (id: number, newTitle: string, newContent: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, title: newTitle, content: newContent } : todo
    ));
    const newtodo0 = todos.find(todo => todo.id === id)
    apiClient.put(`/todos`, { id, todo_title: newTitle, todo_content: newContent ,status:newtodo0?.status})
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  };


  return (
    <div>
      <h1>Todo List</h1>
      
     
      <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
    >
      <TextField id="outlined-basic" label="Title" variant="outlined" value={inputTitle} 
        onChange={(e) => setInputTitle(e.target.value)}/>
      <TextField id="outlined-basic" label="Content" variant="outlined" value={inputContent} 
        onChange={(e) => setInputContent(e.target.value)}/>
      
    </Box>
      <Button onClick={addTodo}>Add</Button>
      <ul>
        {/* <Button onClick={getTodo}>Get</Button> */}
        {todos.map(todo => (
          <li key={todo.id}>
            <span 
              style={{ textDecoration: todo.status ? 'line-through' : 'none' }}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.title}
            </span >

            <span
              style={{ textDecoration: todo.status ? 'line-through' : 'none' }}
              onClick={() => toggleTodo(todo.id)}
            >
              :
              {todo.content}
            </span>
            <Button onClick={() => deleteTodo(todo.id)}>Delete</Button>
            <Button onClick={() => {
              const newTitle = prompt('Enter new title', todo.title);
              const newContent = prompt('Enter new content', todo.content);
              if (newTitle !== null && newContent !== null) {
                updateTodo(todo.id, newTitle, newContent);
              }
            }}>Edit</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;