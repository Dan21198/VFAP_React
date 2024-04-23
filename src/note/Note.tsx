import React, { useState, useEffect } from 'react';
// @ts-ignore
import { fetchAllNotes, createNote, updateNote, deleteNote, fetchNotesByFinishedStatus, fetchNotesByTag } from './NoteAPI.ts';
import { Note } from "../model/Note";
// @ts-ignore
import { fetchTags} from '../tag/TagAPI.ts';
// @ts-ignore
import {  Tag } from "../model/Tag.ts";
import { Button, Container, Row, Col } from 'react-bootstrap';
import './note.css';

const NoteList = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [updatedNote, setUpdatedNote] = useState<Note>({ id: 0, title: '', content: '', finished: false, finishTime: '' });
    const [newNote, setNewNote] = useState<Note>({ id: 0, title: '', content: '', finishTime: '', finished: false });
    const [searchFinished, setSearchFinished] = useState<string>('');
    const [searchTagId, setSearchTagId] = useState<string>('');
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        loadNotes();
        fetchTagsData();
    }, []);

    const loadNotes = async () => {
        try {
            const response = await fetchAllNotes();
            setNotes(response.data);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };

    const fetchTagsData = async () => {
        try {
            const response = await fetchTags();
            setTags(response.data);
        }catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };


    const createNoteHandler = async () => {
        try {
            await createNote(newNote);
            setNewNote({ id: 0, title: '', content: '', finishTime: '', finished: false });
            await loadNotes();
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const startEditing = (noteId: number | null) => {
        if (noteId !== null) {
            setEditingNoteId(noteId);
            const noteToEdit = notes.find(note => note.id === noteId);
            if (noteToEdit) {
                setUpdatedNote({
                    id: noteToEdit.id,
                    title: noteToEdit.title,
                    content: noteToEdit.content,
                    finished: noteToEdit.finished,
                    finishTime: noteToEdit.finishTime
                });
            }
        }
    };

    const cancelEditing = () => {
        setEditingNoteId(null);
        setUpdatedNote({ id: 0, title: '', content: '', finished: false, finishTime: '' });
    };

    const updateNoteHandler = async (noteId: number) => {
        try {
            await updateNote(noteId, updatedNote);
            setEditingNoteId(null);
            setUpdatedNote({ id: 0, title: '', content: '', finished: false, finishTime: '' });
            await loadNotes();
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const deleteNoteHandler = async (noteId: number) => {
        try {
            await deleteNote(noteId);
            await loadNotes();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const searchNotes = async () => {
        try {
            let filteredNotes: Note[] = [];
            if (searchFinished !== '') {
                filteredNotes = await fetchNotesByFinishedStatus(searchFinished === 'true');
            } else if (searchTagId !== '') {
                filteredNotes = await fetchNotesByTag(Number(searchTagId));
            } else {
                await loadNotes();
                return;
            }
            setNotes(filteredNotes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };

    return (
        <Container>
            <Row>
                <Col>
                    <div className="custom-note-form">
                        <div className="main-content">
                            <div className="notes-section">
                                <h2>Existing Notes</h2>
                                {notes.length > 0 ? (
                                    <ul className="list-group">
                                        {notes.map(note => (
                                            <li key={note.id} className="list-group-item">
                                                {editingNoteId !== note.id ? (
                                                    <div>
                                                        <strong>{note.title}</strong> - {note.content}<br /><br />
                                                        <p>Finished: {note.finished ? 'Yes' : 'No'}</p>
                                                        <p>Finish Time: {note.finishTime}</p>
                                                        <Button variant="primary" onClick={() => startEditing(note.id)}>Edit</Button>
                                                        <Button variant="danger" onClick={() => deleteNoteHandler(note.id || 0)}>Delete</Button>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={() => updateNoteHandler(note.id || 0)}>
                                                        <label>Title:</label>
                                                        <input type="text" value={updatedNote.title} className="form-control" onChange={(e) => setUpdatedNote({ ...updatedNote, title: e.target.value })} required /><br /><br />
                                                        <label>Content:</label>
                                                        <textarea value={updatedNote.content} className="form-control" onChange={(e) => setUpdatedNote({ ...updatedNote, content: e.target.value })} required></textarea><br /><br />
                                                        <label>Finished:</label>
                                                        <input type="checkbox" checked={updatedNote.finished} className="form-check-input" onChange={(e) => setUpdatedNote({ ...updatedNote, finished: e.target.checked })} />
                                                        <label>Finish Time:</label>
                                                        <input type="datetime-local" value={updatedNote.finishTime}
                                                               className="form-control"
                                                               onChange={(e) => setUpdatedNote({
                                                                   ...updatedNote,
                                                                   finishTime: e.target.value })} /><br /><br />
                                                        <div className="button-group">
                                                            <Button type="submit">Save</Button>
                                                            <Button type="button" onClick={cancelEditing}>Cancel</Button>
                                                        </div>
                                                    </form>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No notes available.</p>
                                )}
                            </div>

                            <div className="search-section">
                                <form className="search-form">
                                    <div className="form-group">
                                        <label htmlFor="searchFinished">Finished:</label>
                                        <select id="searchFinished" className="form-control" value={searchFinished} onChange={(e) => setSearchFinished(e.target.value)}>
                                            <option value="">All</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="searchTag">Tag:</label>
                                        <select id="searchTag" className="form-control" value={searchTagId}
                                                onChange={(e) => setSearchTagId(e.target.value)}>
                                            <option value="">All</option>
                                            {tags.map(tag => (
                                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="button" className="btn btn-primary search-button"
                                            onClick={searchNotes}>Search
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <hr />

            <Row>
                <Col>
                    <div className="create-note">
                        <h2>Create New Note</h2>
                        <form onSubmit={createNoteHandler}>
                            <div className="form-group">
                                <label>Title:</label>
                                <input type="text" className="form-control" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Content:</label>
                                <textarea className="form-control" value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} required></textarea>
                            </div>
                            <div className="form-group">
                                <label>Finish Time:</label>
                                <input type="datetime-local" className="form-control" value={newNote.finishTime} onChange={(e) => setNewNote({ ...newNote, finishTime: e.target.value })} />
                            </div>
                            <Button variant="primary" type="submit">Create Note</Button>
                        </form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default NoteList;
