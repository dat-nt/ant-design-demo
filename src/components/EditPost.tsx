import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, Button, Typography, Space, Modal } from "antd";
import { Post } from "../types/Post";
import axios from "axios";
import { apiURL } from "../api/apiURL";
import { postsQueryKey } from "../queryKeys/queryKeys";

const updatePost = async (updatedPost: Post) => {
    const response = await axios.put(`${apiURL}/posts/${updatedPost.id}`, updatedPost);
    return response.data;
};

interface EditPostFormProps {
    post: Post;
    onClose: () => void;
}

const EditPost: React.FC<EditPostFormProps> = ({ post, onClose }) => {
    const [userId, setUserId] = useState(post.userId);
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: updatePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postsQueryKey });
            onClose();
            window.alert("Posts updated successfully!");
        },
    });

    const handleSave = () => {
        mutation.mutate({ ...post, userId, title, body });
    };

    return (
        <Modal
            open
            title="Edit Post"
            onCancel={onClose}
            footer={null}
        >
            <Form layout="vertical">
                <Form.Item label="User ID">
                    <InputNumber
                        value={userId}
                        onChange={(value) => setUserId(Number(value))}
                        style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Title">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} />
                </Form.Item>
                <Form.Item label="Body">
                    <Input.TextArea
                        value={body}
                        onChange={(e) => setBody(e.target.value)} />
                </Form.Item>
                <Space >
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={mutation.isPending}
                    >
                        {mutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button type="default" onClick={onClose}>
                        Cancel
                    </Button>
                </Space>
                {mutation.isError && (
                    <Typography.Text type="danger">
                        Error: {mutation.error.message}
                    </Typography.Text>
                )}
            </Form>
        </Modal>

    );
};

export default EditPost;
