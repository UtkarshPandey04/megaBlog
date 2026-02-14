import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import postsService from "../../api/posts";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
            category: post?.category || "",
            tags: post?.tags ? post.tags.join(", ") : "",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [formError, setFormError] = useState("");

    const submit = async (data) => {
        setFormError("");
        try {
            if (post) {
            const file = data.image && data.image[0] ? await postsService.uploadFile(data.image[0]) : null;

                const updatePayload = {
                    ...data,
                    featuredImage: file || null,
                    tags: data.tags || "",
                    category: data.category || "",
                };

            const dbPost = await postsService.updatePost(post.$id, updatePayload);

                if (dbPost) {
                    localStorage.removeItem("megablog_draft");
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
                if (!data.image || !data.image[0]) {
                    setFormError("Please select a featured image before submitting.");
                    return;
                }
            const file = await postsService.uploadFile(data.image[0]);

                if (file) {
                    data.featuredImage = file;
                    const dbPost = await postsService.createPost({
                        ...data,
                        userId: userData.$id,
                        tags: data.tags || "",
                        category: data.category || "",
                    });

                    if (dbPost) {
                        localStorage.removeItem("megablog_draft");
                        navigate(`/post/${dbPost.$id}`);
                    }
                }
            }
        } catch (error) {
            setFormError(error.message || "Something went wrong. Please try again.");
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    React.useEffect(() => {
        if (post) return;
        const subscription = watch((value) => {
            const draft = {
                ...value,
                updatedAt: new Date().toISOString(),
            };
            localStorage.setItem("megablog_draft", JSON.stringify(draft));
        });
        return () => subscription.unsubscribe();
    }, [watch, post]);

    React.useEffect(() => {
        if (post) return;
        const raw = localStorage.getItem("megablog_draft");
        if (!raw) return;
        try {
            const draft = JSON.parse(raw);
            if (draft?.title) setValue("title", draft.title);
            if (draft?.slug) setValue("slug", draft.slug);
            if (draft?.content) setValue("content", draft.content);
            if (draft?.status) setValue("status", draft.status);
            if (draft?.category) setValue("category", draft.category);
            if (draft?.tags) setValue("tags", draft.tags);
        } catch (error) {
            // ignore invalid draft
        }
    }, [setValue, post]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            {formError && (
                <div className="w-full pb-4 sm:px-2">
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                    </div>
                </div>
            )}
            <div className="w-full sm:px-2 lg:w-2/3">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="mt-4 w-full sm:px-2 lg:mt-0 lg:w-1/3">
                <Input
                    label="Category :"
                    placeholder="e.g. Engineering"
                    className="mb-4"
                    {...register("category")}
                />
                <Input
                    label="Tags (comma separated) :"
                    placeholder="react, design, product"
                    className="mb-4"
                    {...register("tags")}
                />
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    multiple={false}
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="mb-4 w-full">
                        <img
                            src={postsService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="w-full rounded-lg object-cover"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive", "draft"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
