import React, { useState, useEffect} from 'react';
// @ts-ignore
import { fetchTags, createTag, deleteTag } from './TagAPI.ts';
import { Form, Button, InputGroup, Container, Row, Col} from 'react-bootstrap';

const TagComponent = () => {
    const [newTagName, setNewTagName] = useState('');
    const [selectedTagId, setSelectedTagId] = useState('');
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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
        }
    };

    const handleCreateTag = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await createTag(newTagName);
            setNewTagName('');
            loadTags();
        } catch (error) {
            console.error('Failed to create tag:', error);
        }
    };

    const handleDeleteTag = async () => {
        try {
            await deleteTag(selectedTagId);
            loadTags();
        } catch (error) {
            console.error('Failed to delete tag:', error);
        }
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
                                onChange={e => setNewTagName(e.target.value)}
                            />
                            <InputGroup>
                                <Button variant="primary" type="submit">Create</Button>
                            </InputGroup>
                        </InputGroup>
                    </Form>

                </Col>
            </Row>

            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2>Existing Tags</h2>
                    <InputGroup className="mb-3">
                        <Form.Control as="select" value={selectedTagId} onChange={e => setSelectedTagId(e.target.value)}>
                            {availableTags.map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </Form.Control>
                        <InputGroup>
                            <Button variant="danger" onClick={handleDeleteTag}>Delete</Button>
                        </InputGroup>
                    </InputGroup>
                </Col>
            </Row>
        </Container>
    );
};

export default TagComponent;
