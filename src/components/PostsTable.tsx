import { apiURL } from "../api/apiURL";
import AddPost from "./AddPost";
import React, { Fragment, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Post } from "../types/Post";
import {
    Table,
    Typography,
    Button,
    Space,
    Modal,
    Pagination,
    Spin,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import EditPost from "./EditPost";
import { postsQueryKey } from "../queryKeys/queryKeys";

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchPosts = async () => {
    const response = await axios.get(`${apiURL}/posts`);
    return response.data;
};

const deletePost = async (postId: number) => {
    const response = await axios.delete(`${apiURL}/posts/${postId}`);
    return response.data;
};

const PostsTable: React.FC = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const queryClient = useQueryClient();

    const { data: posts = [], isLoading, isError, error } = useQuery<Post[]>({
        queryKey: postsQueryKey,
        queryFn: () => delay(1000).then(() => fetchPosts())
    });

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    const mutationDelete = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postsQueryKey });
            alert('Post deleted successfully!');
        },
    });

    const handleDelete = (postId: number) => {
        Modal.confirm({
            title: 'Are you sure to delete this post?',
            onOk() {
                mutationDelete.mutate(postId);
            },
        });
    };

    const handleEdit = (post: Post) => {
        setEditingPost(post);
    };

    const handleCloseEdit = () => {
        setEditingPost(null);
    };

    const handleChangePage = (page: number) => {
        setPage(page);
    };

    const handleChangeRowsPerPage = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" />
            <Typography.Title level={3} style={{ marginLeft: 16 }}>Loading...</Typography.Title>
        </div>
    );

    if (isError) return (
        <Typography.Text type="danger">Error fetching posts: {error.message}</Typography.Text>
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 80,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Body',
            dataIndex: 'body',
            key: 'body',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_text: string, post: Post) => (
                <Space size="middle">
                    <Button type="primary"

                        icon={<EditOutlined />}
                        onClick={() => handleEdit(post)}
                    />
                    <Button type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(post.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Fragment>

            <AddPost />

            {editingPost && (
                <EditPost post={editingPost} onClose={handleCloseEdit} />
            )}

            <Typography.Title
                level={3}
                style={{ textAlign: 'center', marginBottom: '16px' }}
            >Posts Table</Typography.Title>

            <Table
                dataSource={currentPosts}
                columns={columns}
                pagination={false}
                scroll={{ y: 320 }}
                rowKey="id"
            />

            <Pagination
                style={{ marginTop: '16px', textAlign: 'right', padding: '16px' }}
                current={page}
                total={posts.length}
                pageSize={rowsPerPage}
                showQuickJumper
                showSizeChanger
                onShowSizeChange={(_current, size) => handleChangeRowsPerPage(size)}
                onChange={handleChangePage}
                pageSizeOptions={['5', '10', '20', `${posts.length}`]}

            />

        </Fragment>
    );
};

export default PostsTable;
