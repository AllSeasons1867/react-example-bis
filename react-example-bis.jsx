import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const url = 'http://localhost:3000/posts';

// Declare react component
const PostDataExample = () => {
  const [post, setPost] = useState({title: "", body: ""})
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [editState, setEditState] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const inputRef = useRef(null)

  const createPost = async (event) => {
    event.preventDefault()
    if (post.title !== "" && post.body !== "") {
      if (editState === null) {
        try {
          const { data } = await axios.post(url,post,{headers: {"Content-Type": "application/json"}})
          console.log("Successfully created post: ", data)
          setPosts((prevValue) => {
            return (
              [...prevValue, data]
            )
          })
          setPost({title: "", body: ""})
          textFocus()
        } catch (error) {
          console.log("Error creating post: ", error)
          setIsError("Error creating post. Please try again.")
        } 
      } else {
        try {
          const {data} = await axios.put(url+"/"+post.id,post,{headers: {"Content-Type": "application/json"}})
          console.log("Edited post: ", data)
          setPosts((prevValue) => {
            return (
              prevValue.map((element, index) => {
                return (
                  element.id !== data.id ? element : data
                )
              })
            )
          })
          setPost({title: "", body: ""})
          setEditState(null)
          textFocus()
        } catch (error) {
          console.log("Error editing post: ", error)
          setIsError("Error editing post. Please Try again.")
        }
      }
    } else {
      setErrorMessage("Error creating post. Neither the post title nor body can be blank.")
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
      setErrorMessage("Error deleting post. Please try again.")
    }
  }

  const handleChange = (event) => {
    const {name, value} = event.target

    setPost((prevValue) => {
      return ({
        ...prevValue,
        [name]: value
      })
    })
  }

  const cancelEdit = () => {
    setEditState(null)
    setPost({title: "", body: ""})
    textFocus()
  }

  const textFocus = () => {
    inputRef.current?.focus()
  }

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(url,{ headers: { "Accept": "application/json" } })
      console.log("Fetched posts: ", data)
      setPosts(data)
      setIsError(false)
      setIsLoading(false)
      textFocus()
    } catch (error) {
      console.log(error)
      setIsLoading(false)
      setIsError(true)
    }
  }

  useEffect(() => {
    fetchPosts()
  },[])

  useEffect(() => {
    textFocus()
  },[isError,isLoading,errorMessage])

  const ErrorModal = ({message, onClose}) => {
    if (!message) return null

    return (
      <div style={styles.modalBackground}>
        <div style={styles.modalContent}>
          <h3>Error</h3>
          <h4>{message}</h4>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    )
  }

  const styles = {
    modalBackground: {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      width: "300px",
      textAlign: "center"
    }
  }

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
      <h1>Welcome to the anonymous posting locale!</h1>
      <RenderPosts />
      <ErrorModal onClose={() => setErrorMessage(null)} message={errorMessage} />
      <form onSubmit={createPost}>
        <input ref={inputRef} type="text" value={post.title} onChange={handleChange} name="title" placeholder='Type title here...' />
        <input type="text" value={post.body} onChange={handleChange} name="body" placeholder='Type body here...' />
        <button>{editState === null ? "Add" : "Update"}</button>
      </form>
      {editState !== null && <button onClick={cancelEdit}>Cancel Edit</button>}
    </>
  )
};

export default PostDataExample;