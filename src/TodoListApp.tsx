// 定义 Topic 接口
interface Topic {
  id: number;
  topicTitle: string;
  topicContent?: string;
}

// 定义 Todo 接口
interface Todo {
  id: number;
  todoTitle: string;
  todoContent?: string;
  todoStatus: number;
  topicId: number;
  deadline?: Date;
}


import React, { useState,useEffect } from 'react';
import styles from './TodoListApp.module.css';
const apiUrl = import.meta.env.VITE_API_URL;
import axios from 'axios';

const apiClient = axios.create({
  baseURL : apiUrl,
  headers : {
     'Content-Type': 'application/json'
  }
})
// 定义  TodoList 组件
const  TodoListApp: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  //const [responseStatus, setResponseStatus] = useState<{ status: string, message: string } | null>(null);
  //数据加载
  const getTodos = () => {
    
    apiClient.get('/todos')
      .then(function (response) {
        // handle success
        //console.log(response.data.todos);
        const todosData = response.data.todos.map((todo: Todo) => ({
          id: Number(todo.id),
          todoTitle: todo.todoTitle,
          todoContent: todo.todoContent,
          todoStatus: Number(todo.todoStatus),
          topicId: Number(todo.topicId),
          deadline: todo.deadline ? new Date(todo.deadline) : undefined,
        }));
        setTodos(todosData);
        //console.log(response.data.todos);
        //console.log(todos);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }
  useEffect(() => {
    getTodos();
  }, []);

 /*  useEffect(() => {
    // 这里的代码会在 todos 状态更新后执行
    console.log('Updated todos:', todos);
}, [todos]); */

  const getTopics = () => {
    
    apiClient.get('/topics')
      .then(function (response) {
        // handle success
        //console.log(response);
        setTopics(response.data.topics);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }
  useEffect(() => {
    getTopics();
  }, []);

  useEffect(() => {
    if (topics.length > 0) {
      setSelectedTopic(Number(topics[0].id));
      
    }
  }, [topics]);
  /* useEffect(()=>{
    console.log('update topics:' , topics);
  },[topics]); */
  //

  const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(Number(event.target.value));
    //console.log(selectedTopic);
  };
  //debug

  useEffect(()=>{
    console.log('update selectedTopic:' , selectedTopic);
  },[selectedTopic, topics]);
  //debug


  const handleAddTopic = async (topicTitle: string, topicContent?: string) => {
    const tempId = Date.now();
    const newTopic = { id: tempId, topicTitle, topicContent };
    setTopics([...topics, newTopic]);
    //console.log(newTopic);
    try {
      const response = await apiClient.post('/topics', { topicTitle, topicContent });
      //const { updateData } = response.data;
      const trueId = response.data.id;
      setTopics(prevTopics => prevTopics.map(topic => topic.id === tempId ? { ...topic, trueId } : topic));
    } catch (error) {
      console.error(error);
      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== tempId));
    }
  };

  const handleAddTodo = async (todoTitle: string, todoContent?: string, deadline?: Date) => {
    //console.log('aftehandle',todos);
    if (selectedTopic === null) return;
    const tempId = Date.now();
    const defaultDeadline = new Date('1970-01-01');
    const newTodo = { id: tempId, todoTitle, todoContent, todoStatus: 0, topicId: selectedTopic, deadline: deadline || defaultDeadline };
    setTodos([...todos, newTodo]);

    try {
      const response = await apiClient.post('/todos', { todoTitle, todoContent, todoStatus: 0, topicId: selectedTopic, deadline : deadline || defaultDeadline });
      const { id: trueId } = response.data;
      setTodos(prevTodos => prevTodos.map(todo => todo.id === tempId ? { ...todo, id: trueId } : todo));
    } catch (error) {
      console.error(error);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== tempId));
    }
  };

  const handleEditTodo = async (id: number, todoTitle: string, todoContent?: string, deadline?: Date) => {
    const originalTodos = [...todos];
    const newTodos = todos.map(todo => todo.id === id ? { ...todo, todoTitle, todoContent, deadline } : todo);
    setTodos(newTodos);
    const newTodo = newTodos.find(todo => todo.id === id);  
    //console.log('new todo',newTodo);
    try {
      await apiClient.put('/todos', newTodo);
    } catch (error) {
      console.error(error);
      setTodos(originalTodos);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const originalTodos = [...todos];
    setTodos(todos.filter(todo => todo.id !== id));
    

    try {
      await apiClient.delete('/todos',{data :{id}});
    } catch (error) {
      console.error(error);
      setTodos(originalTodos);
    }
  };

  const handleToggleTodoStatus = async (id: number) => {
    const originalTodos = [...todos];
    const updatedTodos = todos.map(todo => todo.id === id ? { ...todo, todoStatus: todo.todoStatus === 0 ? 1 : 0 } : todo);
    setTodos(updatedTodos);
    const updatedTodo = updatedTodos.find(todo => todo.id === id);
    try {
      //const toggledTodo = updatedTodos.find(todo => todo.id === id);
      await apiClient.put('/todos/status', {id,todoStatus : updatedTodo?.todoStatus});
    } catch (error) {
      console.error(error);
      setTodos(originalTodos);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Todo List </h1>
      <TopicSelect topics={topics} onChange={handleTopicChange} />
      <div className={styles.todoContainer}>
      <TodoList 
        todos={todos.filter(todo => todo.topicId === selectedTopic)} 
        onEditTodo={handleEditTodo}
        onDeleteTodo={handleDeleteTodo}
        onToggleTodoStatus={handleToggleTodoStatus}
      />
      </div>
      
      <div className={styles.editContainer}>
     
      <TopicForm onAddTopic={handleAddTopic} />
      <TodoForm onAddTodo={handleAddTodo} />
      </div>
      
      
    </div>
  );
};



// 定义 TopicForm 组件
const TopicForm: React.FC<{ onAddTopic: (topicTitle: string, topicContent?: string) => void }> = ({ onAddTopic }) => {
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAddTopic(topicTitle, topicContent);
    setTopicTitle('');
    setTopicContent('');
  };

  return (
    <form onSubmit={handleSubmit} className = {styles.form}>
      <input type="text" value={topicTitle} onChange={e => setTopicTitle(e.target.value)} placeholder="Topic 标题" required className={styles.input}/>
      <input type="text" value={topicContent} onChange={e => setTopicContent(e.target.value)} placeholder="Topic 描述" className={styles.input}/>
      <button type="submit">添加 Topic</button>
    </form>
  );
};

// 定义 TopicSelect 组件
const TopicSelect: React.FC<{ topics: Topic[], onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ topics, onChange }) => (
  <select onChange={onChange} className={styles.button}>
    <option value="">选择 Topic</option>
    {topics.map(topic => (
      <option key={topic.id} value={topic.id}>{topic.topicTitle}</option>
    ))}
  </select>
);

// 定义 TodoForm 组件
const TodoForm: React.FC<{ onAddTodo: (todoTitle: string, todoContent?: string, deadline?: Date) => void }> = ({ onAddTodo }) => {
  const [todoTitle, setTodoTitle] = useState('');
  const [todoContent, setTodoContent] = useState('');
  const [deadline, setDeadline] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTodo(todoTitle, todoContent, deadline ? new Date(deadline) : undefined);
    setTodoTitle('');
    setTodoContent('');
    setDeadline('');
  };

  return (
    <form onSubmit={handleSubmit} className = {styles.form}>
      <input type="text" value={todoTitle} onChange={e => setTodoTitle(e.target.value)} placeholder="Todo 标题" required className={styles.input}/>
      <input type="text" value={todoContent} onChange={e => setTodoContent(e.target.value)} placeholder="Todo 内容" className={styles.input}/>
      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={styles.input}/>
      <button type="submit">添加 Todo</button>
    </form>
  );
};

// 定义 TodoList 组件
const TodoList: React.FC<{ todos: Todo[], onEditTodo: (id: number, todoTitle: string, todoContent?: string, deadline?: Date) => void, onDeleteTodo: (id: number) => void, onToggleTodoStatus: (id: number) => void }> = ({ todos, onEditTodo, onDeleteTodo, onToggleTodoStatus }) => (
  <ul className = {styles.todoList}>
    {todos.map(todo => (
      <li key={todo.id} className={styles.todoItem}>
        <input type="checkbox" checked={todo.todoStatus === 1} onChange={() => onToggleTodoStatus(todo.id)} className={styles.input}/>
        <span>
        {todo.todoTitle}
        </span>
        <span>
        {todo.todoContent}
        </span>
        <span>
        {todo.deadline && todo.deadline.toISOString().split('T')[0] !== '1970-01-01' ? todo.deadline.toLocaleDateString() : ''}
        </span>
        
        <button onClick={() => {
          const newTitle = prompt('Edit title', todo.todoTitle) || todo.todoTitle;
          const newContent = prompt('Edit content', todo.todoContent) || todo.todoContent;
          const newDeadlineStr = prompt('Edit deadline', todo.deadline?.toISOString().split('T')[0]);
          const newDeadline = newDeadlineStr ? new Date(newDeadlineStr) : todo.deadline;
          onEditTodo(todo.id, newTitle, newContent, newDeadline);
        }}>编辑</button>
        <button onClick={() => onDeleteTodo(todo.id)}>删除</button>
      </li>
    ))}
  </ul>
);



export default  TodoListApp;