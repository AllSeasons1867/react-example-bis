import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const url = 'http://localhost:3000/posts'

const PostDataExample = () => {
////////////////////
  const [post, setPost] = useState({title: "", body: ""})
  const [posts, setPosts] = useState([])
  const [editState, setEditState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const inputRef = useRef(null)

  const createPost = async (event) => {
    event.preventDefault()
    if (post.title !== "" && post.body !== "") {
      if (editState === null) {
        try {
          const { data } = await axios.post(url, post, {headers: { "Content-Type": "application/json" }})
          console.log("Created post: ", data)
          setPosts((prevValue) => {
            return (
              [...prevValue, data]
            )
          })
          setPost({title: "", body: ""})
          textFocus()
        } catch (error) {
          console.log("Error creating post: ", error)
        } 
        } else {
          try {
            const { data } = await axios.put(url+"/"+post.id, post, {headers: {"Content-Type": "application/json"}})
            console.log("Edited post: ", data)
            setPosts((prevValue) => {
              return (
                prevValue.map((element) => {
                  return (
                    element.id === data.id ? data : element
                  )
                })
              )
            })
            setPost({title: "", body: ""})
            setEditState(null)
            textFocus()
          } catch (error) {
            console.log("Error editing post: ", error)
          }
        }
      }
    }


  const RenderPosts = () => {
    return (
      posts.map((element, index) => {
        return (
          <div key={element.id}>
            <h3>{element.title}</h3>
            <h4>{element.body}</h4>
            {editState === null && <><button onClick={() => deletePost(element.id)}>Delete</button>
                                     <button onClick={() => updatePost({...element})}>Edit</button></>}
          </div>
        )
      })
    )
  }

  const updatePost = ({title, body, id}) => {
    setPost({title, body, id})
    setEditState(id)
    textFocus()
  }

  const deletePost = async (id) => {
    try {
      const { data } = await axios.delete(url+"/"+id, {headers: {"Content-Type": "application/json"}})
      console.log("Deleted post: ", data)
      setPosts((prevValue) => {
        return (
          prevValue.filter((element, index) => {
            return (
              element.id !== data.id
            )
          })
        )
      })
      textFocus()
    } catch (error) {
      console.log("Error deleting post: ", error)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(url, {headers: { "Accept": "application/json" }})
      console.log("Fetched users: ", data)
      setPosts(data)
      setIsError(false)
      setIsLoading(false)
      textFocus()
    } catch (error) {
      console.log("Error fetching posts: ", error)
      setIsError(true)
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditState(null)
    setPost({title: "", body: ""})
    textFocus()
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setPost((prevValue) => {
      return ({
        ...prevValue,
        [name]: value
      })
    })
  }

  const textFocus = () => {
    inputRef.current?.focus()
  }

  useEffect(() => {
    fetchPosts()
  },[])

  useEffect(() => {
    if (!isLoading && !isError) {
      textFocus()
    }
  },[isLoading, isError])

  if (isLoading) {
    return (
      <>
        <h1>Loading posts...</h1>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <h1>Error loading posts...</h1>
      </>
    )
  }

  return (
    <>
      <h2>Welcome to the post machine!</h2>
      <RenderPosts />
      <form onSubmit={createPost}>
        <input ref={inputRef} type="text" name="title" value={post.title} onChange={handleChange} />
        <input type="text" name="body" value={post.body} onChange={handleChange} />
        <button>{editState === null ? "Add" : "Update"}</button>
      </form>
      {editState !== null && <button onClick={cancelEdit}>Cancel Edit</button>}
    </>
  )
////////////////////
};

export default PostDataExample;

