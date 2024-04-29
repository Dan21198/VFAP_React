import React, { useState, useEffect } from 'react';
// @ts-ignore
import { fetchAllNotes, createNote, updateNote, deleteNote, fetchNotesByFinishedStatus, fetchNotesByTag } from './NoteAPI.ts';
import { Note } from "../model/Note";
// @ts-ignore
import {assignTagToNote, fetchTags, getTagsByNoteId, removeTagFromNote} from '../tag/TagAPI.ts';
// @ts-ignore
import {  Tag } from "../model/Tag.ts";
import {Button, Container, Row, Col, FormGroup, Form} from 'react-bootstrap';
import './note.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NoteList = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [updatedNote, setUpdatedNote] = useState<Note>({ id: 0, title: '', content: '', finished: false, finishTime: '', tags: [] });
    const [newNote, setNewNote] = useState<Note>({ id: 0, title: '', content: '', finishTime: '', finished: false, tags: [] });
    const [searchFinished, setSearchFinished] = useState<string>('');
    const [searchTagId, setSearchTagId] = useState<string>('');
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<string>('');
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [sortKey, setSortKey] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [notesPerPage, setNotesPerPage] = useState(3);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadNotes();
        fetchTagsData();
    }, []);

    const loadNotes = async (page = 1) => {
        try {
            const notesResponse = await fetchAllNotes();
            const notesData = notesResponse.data;

            const sortedNotes = sortNotes(notesData, sortKey, sortOrder);

            const startIndex = (page - 1) * notesPerPage;
            const endIndex = startIndex + notesPerPage;

            const currentNotes = sortedNotes.slice(startIndex, endIndex);

            const notesWithTag = await Promise.all(currentNotes.map(async (note: Note) => {
                const tagsForNoteResponse = await getTagsByNoteId(note.id || 0);
                return { ...note, tags: tagsForNoteResponse.data };
            }));

            setNotes(notesWithTag);
            setCurrentPage(page);
            setTotalPages(Math.ceil(notesData.length / notesPerPage));
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
        loadNotes(currentPage);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        loadNotes(newPage);
    };

    const fetchTagsData = async () => {
        try {
            const response = await fetchTags();
            setTags(response.data);
            setAvailableTags(response.data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const sortNotes = (notes: Note[], sortKey: string, sortOrder: string) => {
        return notes.sort((a: any, b: any) => {
            if (a[sortKey] < b[sortKey]) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (a[sortKey] > b[sortKey]) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
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
                console.log("Starting edit for note:", noteToEdit);
                setUpdatedNote({
                    ...noteToEdit,
                    tags: noteToEdit.tags ? noteToEdit.tags.map(tag => ({ ...tag })) : []
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
            const { tags, ...updatedNoteWithoutTags } = updatedNote;
            console.log("Sending updated note to API:", updatedNoteWithoutTags);

            await updateNote(noteId, updatedNoteWithoutTags);
            console.log("Update note API called successfully.");

            await loadNotes(); // Reload notes to reflect the updated information
            console.log("Notes reloaded after update.");
            setEditingNoteId(null); // Reset the editing state
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

            const notesWithTag = await Promise.all(filteredNotes.map(async (note: Note) => {
                const tagsForNoteResponse = await getTagsByNoteId(note.id || 0);
                const noteTags = tagsForNoteResponse.data;
                return {
                    ...note,
                    tags: noteTags
                };
            }));

            setNotes(notesWithTag);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };

    const updateNotesAfterTagChange = async () => {
        await loadNotes();
    };

    const assignTag = async (tagId: number) => {
        try {
            if (editingNoteId !== null) {
                await assignTagToNote(Number(tagId), editingNoteId);
                await updateNotesAfterTagChange();
            }
        } catch (error) {
            console.error('Failed to assign tag to note:', error);
        }
    };

    const unassignTag = async (tagId: number) => {
        try {
            if (editingNoteId !== null) {
                await removeTagFromNote(Number(tagId), editingNoteId);
                await updateNotesAfterTagChange();
            }
        } catch (error) {
            console.error('Failed to remove tag from note:', error);
        }
    };


    return (
        <Container>
            <Row>
                <Col>
                    <div className="custom-note-form">
                        <div className="main-content">
                            <div className="notes-section">
                                <Row>
                                    <Col>
                                        <div className="sort-toggle-wrapper">
                                            <Button
                                                onClick={toggleSortOrder}
                                                variant="light"
                                                className="sort-toggle-button"
                                                aria-label="Toggle sort order"
                                            >
                                                {sortOrder === 'asc' ?
                                                    <i className="bi bi-sort-alpha-down-alt"></i> :
                                                    <i className="bi bi-sort-alpha-down"></i>}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                                <h2>Existing Notes</h2>
                                {notes.length > 0 ? (
                                    <ul className="list-group">
                                        {notes.map(note => (
                                            <li key={note.id} className="list-group-item">
                                                {editingNoteId !== note.id ? (
                                                    <div>
                                                        <strong>{note.title}</strong> - {note.content}<br/><br/>
                                                        <p>Finished: {note.finished ? 'Yes' : 'No'}</p>
                                                        <p>Finish Time: {note.finishTime}</p>
                                                        <p>Tags: {note.tags ? note.tags.map(tag => tag.name).join(', ') : 'No tags'}</p>
                                                        <Button variant="primary"
                                                                onClick={() => startEditing(note.id)}>Edit</Button>
                                                        <Button variant="danger"
                                                                onClick={() => deleteNoteHandler(note.id || 0)}>Delete</Button>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={() => updateNoteHandler(note.id || 0)}>
                                                        <label>Title:</label>
                                                        <input type="text" value={updatedNote.title}
                                                               className="form-control"
                                                               onChange={(e) => setUpdatedNote({
                                                                   ...updatedNote,
                                                                   title: e.target.value
                                                               })} required/><br/><br/>
                                                        <label>Content:</label>
                                                        <textarea value={updatedNote.content} className="form-control"
                                                                  onChange={(e) => setUpdatedNote({
                                                                      ...updatedNote,
                                                                      content: e.target.value
                                                                  })} required></textarea><br/><br/>
                                                        <label>Finished:</label>
                                                        <input type="checkbox" checked={updatedNote.finished}
                                                               className="form-check-input"
                                                               onChange={(e) => setUpdatedNote({
                                                                   ...updatedNote,
                                                                   finished: e.target.checked
                                                               })}/>
                                                        <label>Finish Time:</label>
                                                        <input type="datetime-local" value={updatedNote.finishTime}
                                                               className="form-control"
                                                               onChange={(e) => setUpdatedNote({
                                                                   ...updatedNote,
                                                                   finishTime: e.target.value
                                                               })}/><br/><br/>
                                                        <FormGroup>
                                                            <Form.Label>Tags:</Form.Label>
                                                            <Form.Control as="select" value={selectedTagId}
                                                                          onChange={(e) => setSelectedTagId(e.target.value)}>
                                                                <option value="">Select Tag</option>
                                                                {availableTags.map(tag => (
                                                                    <option key={tag.id}
                                                                            value={tag.id}>{tag.name}</option>
                                                                ))}
                                                            </Form.Control>
                                                        </FormGroup>
                                                        <div className="button-group">
                                                            <Button variant="primary" type="button"
                                                                    onClick={() => assignTag(Number(selectedTagId))}>Assign
                                                                Tag</Button>
                                                            <Button variant="danger" type="button"
                                                                    onClick={() => unassignTag(Number(selectedTagId))}>Unassign
                                                                Tag</Button>
                                                        </div>

                                                            <div className="button-group">
                                                                <Button type="submit">Save</Button>
                                                                <Button type="button"
                                                                        onClick={cancelEditing}>Cancel</Button>
                                                            </div>
                                                    </form>
                                                    )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No notes available.</p>
                                )}
                                <Row>
                                    <Col>
                                        <div className="pagination">
                                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                                <span
                                                    key={page}
                                                    className={`page-dot ${page === currentPage ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                />
                                            ))}
                                        </div>
                                    </Col>
                                </Row>
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
