import React, { useRef } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Form,
    Input,
    InputNumber,
    Button,
    Typography,
} from "antd";
import { NewPost } from "../types/NewPost";
import { apiURL } from "../api/apiURL";
import { postsQueryKey } from "../queryKeys/queryKeys";

const addPost = async (newPost: NewPost) => {
    const response = await axios.post(`${apiURL}/posts`, newPost);
    return response.data;
};

const AddPost: React.FC = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postsQueryKey });
            form.resetFields();
            if (firstInputRef.current) {
                firstInputRef.current.focus();
            }
            window.alert(`Post added successfully!`);
        },
    });

    const handleSubmit = (values: { title: string; body: string; userId: number }) => {
        mutation.mutate(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginBottom: 32 }}
        >
            <Typography.Title
                level={3}
                style={{ textAlign: 'center', marginBottom: '16px' }}
            >Add New Post</Typography.Title>
            <Form.Item
                name="userId"
                label="User ID"
                rules={[{ required: true, message: "Please input the User ID!" }]}
            >
                <InputNumber
                    ref={firstInputRef}
                    style={{ width: "100%" }}
                />
            </Form.Item>
            <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: "Please input the Title!" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="body"
                label="Body"
                rules={[{ required: true, message: "Please input the Body!" }]}
            >
                <Input.TextArea />
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={mutation.isPending}
                >
                    {mutation.isPending ? "Adding..." : "Add Post"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AddPost;
