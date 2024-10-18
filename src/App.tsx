import React, { useState, useEffect, CSSProperties } from 'react';
import axios from 'axios';
import TodoList from './components/TodoList/TodoList';
import TodoForm from './components/TodoForm/TodoForm';
import Modal from './components/Modal/Modal';
import { Todo } from '@/types';
import { ClipLoader } from 'react-spinners';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<number | null>(0);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get<{ todos: Todo[], nextCursor: number | null }>(
          `http://localhost:8080/todos/scroll?nextCursor=0&limit=20&sort=title&order=asc`
        );
        setTodos(response.data.todos);
        setNextCursor(response.data.nextCursor);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const fetchMoreTodos = async () => {
    if (nextCursor === null || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const response = await axios.get<{ todos: Todo[], nextCursor: number | null }>(
        `http://localhost:8080/todos/scroll?nextCursor=${nextCursor}&limit=20&sort=title&order=asc`
      );
      setTodos((prevTodos) => [...prevTodos, ...response.data.todos]);
      setNextCursor(response.data.nextCursor);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetchingMore(false);
    }
  };

  let debounceTimer: ReturnType<typeof setTimeout>;
  const handleScroll = () => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !isFetchingMore) {
        fetchMoreTodos();
      }
    }, 200);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [nextCursor, isFetchingMore]);

  const addTodoOptimistically = (todo: Todo) => {
    setTodos((prevTodos) => {
      const existingIndex = prevTodos.findIndex(t => t.id === todo.id);
      if (existingIndex !== -1) {
        const updatedTodos = [...prevTodos];
        updatedTodos[existingIndex] = todo;
        return updatedTodos;
      }
      return [todo, ...prevTodos];
    });
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  const handleEditComplete = async (editedTodo: Todo) => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8080/todos/${editedTodo.id}`, {
        title: editedTodo.title,
        completed: editedTodo.completed,
        date: editedTodo.date
      });

      setTodos((prevTodos) =>
        prevTodos.map(todo => (todo.id === editedTodo.id ? { ...todo, ...response.data } : todo))
      );
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo.');
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const override: CSSProperties = {
    textAlign: "center",
    display: "block",
    margin: "0 auto",
  };

  return (
    <>
      <main>
        <h1 className='title text-center'>Let's Get Things Done!</h1>
        <p className='description'>One Step Closer to Your Goals</p>

        <div className='container'>
          <TodoForm
            onAdd={addTodoOptimistically}
          />
          <TodoList
            todos={todos}
            loading={loading}
            error={error}
            onDelete={deleteTodo}
            onClick={openModal}
          />
          {(loading || isFetchingMore) && (
            <ClipLoader
              color='#601FEB'
              size={30}
              cssOverride={override}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          )}
        </div>
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedTodo ? selectedTodo.title : ''}
        id={selectedTodo ? selectedTodo.id : ''}
        todoToEdit={selectedTodo}
        onEditComplete={handleEditComplete}
      />
    </>
  );
};

export default App;
