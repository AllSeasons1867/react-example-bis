// Import react hooks necessary to make CRUD actions functional
import { useState, useEffect, useRef } from 'react';

// Import axios library to communicate with database API
import axios from 'axios';

// Assign API URL to a variable for ease of handling
const url = 'http://localhost:3000/posts'

// Declare react component 
const PostDataExample = () => {
  // Declare specific useState hooks necessary to keep track of state between renders
  const [post, setPost] = useState({title: "", body: ""})
  const [posts, setPosts] = useState([])
  const [editState, setEditState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // useRef hook is used to maintain focus on text input field 
  const inputRef = useRef(null)

  // This function is responsible for appending new posts and edited posts to the client's local copy of the post list in addition to the server's database copy
  const createPost = async (event) => {
    event.preventDefault()
    if (post.title !== "" && post.body !== "") {

      // If the current post is a new post the application we follow the first branch of the if statement
      if (editState === null) {
        // Axios is used to append the new post to the database. If the append is successful we use setPosts to append the new post to the client's local copy of the post list.
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

        // If the current post is an existing one to be edited we follow the second branch of the if statement 
        } else {
          // A try-catch block is used to edit the database's copy of the post list first. If the edit is successful we update the local copy via setPosts.
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

  // This function displays all of the posts currently present within the posts array instantiated by useState by mapping over them
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

  // This function activates when the user clicks the 'edit' button. It sets the current post to be edited and the editState variable to the post's id. 
  const updatePost = ({title, body, id}) => {
    setPost({title, body, id})
    setEditState(id)
    textFocus()
  }

  // This function deletes a given post by first deleting the database copy via the axios delete method. It then proceeds to delete the local copy of the post by filtering through them and looking for a matching id. 
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

  // This function retreives all of the posts from the database using an axios get request. A try/catch block is used for error handling.
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

  // This function is only available to the user when edit mode is activated. The function turns edit mode off and sets the current post to blank. 
  const cancelEdit = () => {
    setEditState(null)
    setPost({title: "", body: ""})
    textFocus()
  }

  // This function ensures data consistency between the current useState of the post and what the user has entered into the page's form
  const handleChange = (event) => {
    const { name, value } = event.target

    setPost((prevValue) => {
      return ({
        ...prevValue,
        [name]: value
      })
    })
  }

  // This function changes the browser's focus to the first input text field
  const textFocus = () => {
    inputRef.current?.focus()
  }

  // This useEffect ensures that posts are retrieved from the database after initial render 
  useEffect(() => {
    fetchPosts()
  },[])

  // This useEffect ensures that the focus of the application defaults to the first input text field upon initial render and when the loading and error variables change
  useEffect(() => {
    if (!isLoading && !isError) {
      textFocus()
    }
  },[isLoading, isError])

  // This is the first of three conditional renders. This h1 will render if the application is still loading posts from the database.
  if (isLoading) {
    return (
      <>
        <h1>Loading posts...</h1>
      </>
    )
  }

  // This is the second of three conditional renders. This h1 will render if the application has encountered and error. 
  if (isError) {
    return (
      <>
        <h1>Error loading posts...</h1>
      </>
    )
  }

  // This is the final conditional render. This block of JSX will render when there are no errors and the posts have finished loading
  return (
    <>
      <h2>Welcome to the post machine!</h2>

      {/* This component renders all of the posts from the database by mapping over them arranged in an array */}
      <RenderPosts />

      {/* This form is where users can create new posts and edit existing ones. */}
      <form onSubmit={createPost}>
        <input ref={inputRef} type="text" name="title" value={post.title} onChange={handleChange} />
        <input type="text" name="body" value={post.body} onChange={handleChange} />
        <button>{editState === null ? "Add" : "Update"}</button>
      </form>
      {editState !== null && <button onClick={cancelEdit}>Cancel Edit</button>}
    </>
  )
};

// This export statement allows the PostDataExample component to be imported by other components
export default PostDataExample;

