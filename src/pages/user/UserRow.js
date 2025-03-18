const UserRow = (props) =>{
    const {users} = props;
    return (

        <tr key={users.id}>
            <td>{users.id}</td>
            <td>{users.name}</td>
            <td>{users.age}</td>
            <td>{users.email}</td>
            <td>
            <button className="btn edit-btn">Edit</button>
            <button className="btn delete-btn">Delete</button>
            </td>
        </tr>
    )
}

export default UserRow; 