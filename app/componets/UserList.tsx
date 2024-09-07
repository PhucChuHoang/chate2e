// components/UserList.tsx

import React from "react";
import { useUser } from "../context/UserContext";

interface User {
  id: string;
  name: string;
}

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser }) => {
  const { userName } = useUser();

  const filteredUsers = users.filter(user => user.name !== userName);

  return (
    <div style={{ borderRight: "1px solid #ccc", padding: "20px", width: "250px" }}>
      <h3>Connected Users</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <li
              key={user.id}
              style={{ margin: "10px 0", cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={() => onSelectUser(user)}
            >
              <img
                src={`https://i.pravatar.cc/40?u=${user.id}`}
                alt={user.name}
                style={{ borderRadius: "50%", marginRight: "10px" }}
              />
              {user.name}
            </li>
          ))
        ) : (
          <li>No users available</li>
        )}
      </ul>
    </div>
  );
};

export default UserList;
