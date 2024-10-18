import { Todo } from '@/types';
import { GoTrash } from 'react-icons/go';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TodoList = ({ todos, loading, error, onDelete, onClick }: { todos: Todo[], loading: boolean, error: string | null, onDelete: (id: string) => void, onClick: (todo: Todo) => void }) => {

    if (loading) return <>
        <Skeleton count={5} height={50} style={{ marginBottom: "0.5rem", borderRadius: "5rem" }} />
    </>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='list__group'>
            {todos.map((todo: any, i) => (
                <div className='list' key={i} onClick={() => onClick(todo)}>
                    <input type="checkbox" checked={todo.completed} readOnly />
                    <label>{todo.title}</label>
                    <button type='button' onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}>
                        <GoTrash className='icon-trash' size={20} />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default TodoList;
