import React, { useState } from 'react';
import axios from 'axios';
import { Todo } from '@/types';

interface TodoFormProps {
    onAdd: (todo: Todo) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
    const [title, setTitle] = useState<string>('');
    const [completed, setCompleted] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        const newTodo: Todo = {
            id: `temp-${Date.now()}`,
            title,
            completed,
            date: new Date().toISOString(),
        };

        setTitle('');

        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:8080/todos', { title, completed });

            onAdd({ ...newTodo, id: response.data.id });
        } catch (error) {
            console.error('Error saving task:', error);
            onAdd({ ...newTodo, completed: !completed });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form method='POST' onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder='Create new task'
                autoFocus={true}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
            />
            <button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : "Add"}
            </button>
        </form>
    );
};

export default TodoForm;
