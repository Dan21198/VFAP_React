import React, { useState, useEffect } from 'react';
// @ts-ignore
import { fetchAllNotes, createNote, updateNote, deleteNote, fetchNotesByFinishedStatus, fetchNotesByTag } from './NoteAPI.ts';
import { Note } from "../model/Note";
// @ts-ignore
import {assignTagToNote, fetchTags, getTagsByNoteId, removeTagFromNote} from '../tag/TagAPI.ts';
// @ts-ignore
import {  Tag } from "../model/Tag.ts";
import {Button, Container, Row, Col, FormGroup, Form, Tabs, Tab} from 'react-bootstrap';
import './note.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {SnackbarProps} from "../model/SnackbarProps";

const Snackbar = ({ show, message, onClose, variant }: SnackbarProps) => {
    return (
        <div className={`snackbar ${variant}`} style={{ display: show ? 'flex' : 'none' }}>
            <div>{message}</div>
            <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};

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
    const [sortKey] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [notesPerPage] = useState(3);
    const [totalPages, setTotalPages] = useState(0);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVariant, setSnackbarVariant] = useState<'success' | 'error'>('success');

    useEffect(() => {
        loadNotes();
        fetchTagsData();
    }, []);

    const loadNotes = async (page = 1, sortKey = 'title', sortOrder = 'asc') => {
        try {
            const notesResponse = await fetchAllNotes();
            let notesData = notesResponse.data;

            const notesWithTags = await Promise.all(notesData.map(async (note: Note) => {
                const tagsForNoteResponse = await getTagsByNoteId(note.id || 0);
                return { ...note, tags: tagsForNoteResponse.data };
            }));

            const sortedNotes = sortNotes(notesWithTags, sortKey, sortOrder);

            const startIndex = (page - 1) * notesPerPage;
            const endIndex = startIndex + notesPerPage;
            const currentNotes = sortedNotes.slice(startIndex, endIndex);

            setNotes(currentNotes);
            setTotalPages(Math.ceil(notesWithTags.length / notesPerPage));
            setCurrentPage(page);
        } catch (error) {
        }
    };

    const toggleSortOrder = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        loadNotes(currentPage, sortKey, newSortOrder);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        loadNotes(newPage, sortKey, sortOrder);
    };

    const fetchTagsData = async () => {
        try {
            const response = await fetchTags();
            setTags(response.data);
            setAvailableTags(response.data);
        } catch (error) {
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
            showSnackbarWithMessage('Note created successfully', 'success');
        } catch (error) {
            showSnackbarWithMessage('Failed to create note', 'error');
        }
    };

    const startEditing = (noteId: number | null) => {
        if (noteId !== null) {
            setEditingNoteId(noteId);
            const noteToEdit = notes.find(note => note.id === noteId);
            if (noteToEdit) {
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

            await updateNote(noteId, updatedNoteWithoutTags);

            await loadNotes();
            setEditingNoteId(null);
            showSnackbarWithMessage('Note updated successfully', 'success');
        } catch (error) {
            showSnackbarWithMessage('Failed to update note', 'error');
        }
    };

    const deleteNoteHandler = async (noteId: number) => {
        try {
            await deleteNote(noteId);
            await loadNotes();
            showSnackbarWithMessage('Note deleted successfully', 'success');
        } catch (error) {
            showSnackbarWithMessage('Failed to delete note', 'error');
        }
    };

    const searchNotes = async () => {
        try {
            let filteredNotes = [];
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
                return { ...note, tags: tagsForNoteResponse.data };
            }));

            const sortedNotes = sortNotes(notesWithTag, sortKey, sortOrder);
            setNotes(sortedNotes);
            setTotalPages(Math.ceil(sortedNotes.length / notesPerPage));
            setCurrentPage(1);
        } catch (error) {
            showSnackbarWithMessage('Failed to search notes', 'error');
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
            showSnackbarWithMessage('Failed to assign tag to note', 'error');
        }
    };

    const unassignTag = async (tagId: number) => {
        try {
            if (editingNoteId !== null) {
                await removeTagFromNote(Number(tagId), editingNoteId);
                await updateNotesAfterTagChange();
            }
        } catch (error) {
            showSnackbarWithMessage('Failed to remove tag from note', 'error');
        }
    };

    const showSnackbarWithMessage = (message: string, variant: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarVariant(variant);
        setShowSnackbar(true);
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };


    return (
        <Container>
            <Tabs defaultActiveKey="notes" id="note-tabs">
                <Tab eventKey="notes" title="Notes">
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
                                                            <i className="bi bi-sort-alpha-down"></i> :
                                                            <i className="bi bi-sort-alpha-down-alt"></i>}
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                        <h2>Existing Notes</h2>
                                        {notes.length > 0 ? (
                                            <table className="table">
                                                <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Content</th>
                                                    <th>Finished</th>
                                                    <th>Finish Time</th>
                                                    <th>Tags</th>
                                                    <th>Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {notes.map(note => (
                                                    <tr key={note.id}>
                                                        {editingNoteId !== note.id ? (
                                                            <>
                                                                <td>{note.title}</td>
                                                                <td>{note.content}</td>
                                                                <td>{note.finished ? 'Yes' : 'No'}</td>
                                                                <td>{note.finishTime}</td>
                                                                <td>{note.tags ? note.tags.map(tag => tag.name).join(', ') : ''}</td>
                                                                <td>
                                                                    <Button variant="primary"
                                                                            onClick={() => startEditing(note.id)}>Edit</Button>
                                                                    <Button variant="danger"
                                                                            onClick={() => deleteNoteHandler(note.id || 0)}>Delete</Button>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={updatedNote.title}
                                                                        onChange={(e) => setUpdatedNote({
                                                                            ...updatedNote,
                                                                            title: e.target.value
                                                                        })}
                                                                        required
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <textarea
                                                                        className="form-control"
                                                                        value={updatedNote.content}
                                                                        onChange={(e) => setUpdatedNote({
                                                                            ...updatedNote,
                                                                            content: e.target.value
                                                                        })}
                                                                        required
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={updatedNote.finished}
                                                                        className="form-check-input"
                                                                        onChange={(e) => setUpdatedNote({
                                                                            ...updatedNote,
                                                                            finished: e.target.checked
                                                                        })}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="datetime-local"
                                                                        className="form-control"
                                                                        value={updatedNote.finishTime}
                                                                        onChange={(e) => setUpdatedNote({
                                                                            ...updatedNote,
                                                                            finishTime: e.target.value
                                                                        })}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        className="form-control"
                                                                        value={selectedTagId}
                                                                        onChange={(e) => setSelectedTagId(e.target.value)}
                                                                    >
                                                                        <option value="">Select Tag</option>
                                                                        {availableTags.map(tag => (
                                                                            <option key={tag.id}
                                                                                    value={tag.id}>{tag.name}</option>
                                                                        ))}
                                                                    </select>
                                                                    <Button variant="primary" type="button"
                                                                            onClick={() => assignTag(Number(selectedTagId))}>Assign
                                                                        Tag</Button>
                                                                    <Button variant="danger" type="button"
                                                                            onClick={() => unassignTag(Number(selectedTagId))}>Unassign
                                                                        Tag</Button>
                                                                </td>
                                                                <td>
                                                                    <Button type="submit"
                                                                            onClick={() => updateNoteHandler(note.id || 0)}>Save</Button>
                                                                    <Button type="button"
                                                                            onClick={cancelEditing}>Cancel</Button>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
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
                                                <select id="searchFinished" className="form-control"
                                                        value={searchFinished}
                                                        onChange={(e) => setSearchFinished(e.target.value)}>
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
                </Tab>
                <Tab eventKey="create" title="Create">
                    <Row>
                        <Col>
                            <div className="create-note">
                                <h2>Create New Note</h2>
                                <form onSubmit={createNoteHandler}>
                                    <div className="form-group">
                                        <label>Title:</label>
                                        <input type="text" className="form-control" value={newNote.title}
                                               onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                                               required/>
                                    </div>
                                    <div className="form-group">
                                        <label>Content:</label>
                                        <textarea className="form-control" value={newNote.content}
                                                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                                                  required></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Finish Time:</label>
                                        <input type="datetime-local" className="form-control" value={newNote.finishTime}
                                               onChange={(e) => setNewNote({...newNote, finishTime: e.target.value})}/>
                                    </div>
                                    <Button variant="primary" type="submit">Create Note</Button>
                                </form>
                            </div>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
            <Snackbar
                show={showSnackbar}
                message={snackbarMessage}
                onClose={handleCloseSnackbar}
                variant={snackbarVariant}
            />
        </Container>
    );

};

export default NoteList;
