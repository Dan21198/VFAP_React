import React, { useState, useEffect } from 'react';
// @ts-ignore
import { fetchTags, createTag, deleteTag } from './TagAPI.ts';
import { Form, Button, InputGroup, Container, Row, Col } from 'react-bootstrap';
import './tag.css';
import '../global.css';
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

const TagComponent = () => {
    const [newTagName, setNewTagName] = useState('');
    const [selectedTagId, setSelectedTagId] = useState('');
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVariant, setSnackbarVariant] = useState<'success' | 'error'>('success');

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            const response = await fetchTags();
            setAvailableTags(response.data);
            if (response.data.length > 0) {
                setSelectedTagId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            showSnackbarWithMessage('Failed to fetch tags', 'error');
        }
    };

    const handleCreateTag = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await createTag(newTagName);
            setNewTagName('');
            await loadTags();
            showSnackbarWithMessage('Tag created successfully', 'success');
        } catch (error) {
            console.error('Failed to create tag:', error);
            showSnackbarWithMessage('Failed to create tag', 'error');
        }
    };

    const handleDeleteTag = async () => {
        try {
            await deleteTag(selectedTagId);
            await loadTags();
            showSnackbarWithMessage('Tag deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete tag:', error);
            showSnackbarWithMessage('Failed to delete tag', 'error');
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
        <Container className="my-4">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2>Create New Tag</h2>
                    <Form onSubmit={handleCreateTag}>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Enter new tag name"
                                value={newTagName}
                                className="input-padding"
                                onChange={e => setNewTagName(e.target.value)}
                            />
                            <InputGroup>
                                <Button variant="primary" type="submit" className="button-padding mt-1">Create</Button>
                            </InputGroup>
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2>Existing Tags</h2>
                    <InputGroup className="mb-3">
                        <Form.Control as="select" value={selectedTagId}
                                      onChange={e => setSelectedTagId(e.target.value)}>
                            {availableTags.map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </Form.Control>
                        <InputGroup>
                            <Button variant="danger" onClick={handleDeleteTag}
                                    className="button-padding mt-1">Delete</Button>
                        </InputGroup>
                    </InputGroup>
                </Col>
            </Row>

            <Snackbar
                show={showSnackbar}
                message={snackbarMessage}
                onClose={handleCloseSnackbar}
                variant={snackbarVariant}
            />
        </Container>
    );
}

export default TagComponent;
