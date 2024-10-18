import { Todo } from '@/types';
import React, { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    id: string;
    todoToEdit?: Todo; // Menambahkan prop untuk todo yang sedang diedit
    onEditComplete: (editedTodo: Todo) => void; // Fungsi untuk menyimpan perubahan
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, todoToEdit, onEditComplete }) => {
    const [title, setTitle] = useState<string>('');

    useEffect(() => {
        if (todoToEdit) {
            setTitle(todoToEdit.title);
        }
    }, [todoToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (todoToEdit) {
            onEditComplete({ ...todoToEdit, title });
        }
        onClose();
    };

    return (
        <div className='modal__overlay'>
            <div className='modal__contain'>
                <div className='modal__title'>
                    <h5>Edit Task</h5>
                </div>
                <form method='POST' onSubmit={handleSubmit}>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <button type='submit'>Save</button>
                </form>
            </div>
        </div>
    );
};

export default Modal;
