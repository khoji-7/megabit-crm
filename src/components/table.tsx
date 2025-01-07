"use client";

import React, { useEffect, useState, useCallback } from "react";

// User interface
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
}

const Table: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userModal, setUserModal] = useState<{ show: boolean, type: 'add' | 'edit', user?: User }>({ show: false, type: 'add' });
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For image preview

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://reqres.in/api/users?page=2");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  // Handle image upload
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Add or Edit user
  const saveUser = useCallback(async (user: User) => {
    const url = user.id ? `https://reqres.in/api/users/${user.id}` : "https://reqres.in/api/users";
    const method = user.id ? "PUT" : "POST";
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error("Failed to save user");
      const savedUser = await response.json();
      setData(prevData => 
        user.id ? prevData.map((item) => (item.id === savedUser.id ? savedUser : item)) : [...prevData, savedUser]
      );
      setUserModal({ show: false, type: 'add' }); // Close modal
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: number) => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete user");
      setData(prevData => prevData.filter((user) => user.id !== id)); // Optimistic delete
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return (
    <div className="max-w-[95%] mx-auto p-4 bg-gray-900 rounded-lg shadow-lg">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="overflow-x-auto rounded-lg bg-slate-800 shadow-md">
        <table className="w-full text-left table-auto">
          <thead>
            <tr>
              <th className="p-4 text-white bg-slate-700">Id</th>
              <th className="p-4 text-white bg-slate-700">Name</th>
              <th className="p-4 text-white bg-slate-700">Last Name</th>
              <th className="p-4 text-white bg-slate-700">Email</th>
              <th className="p-4 text-white bg-slate-700">Image</th>
              <th className="p-4 text-white bg-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user) => (
              <tr key={user.id} className="bg-slate-800 hover:bg-slate-700">
                <td className="p-4 text-white">{user.id}</td>
                <td className="p-4 text-white">{user.first_name} </td>
                <td className="p-4 text-white"> {user.last_name}</td>

                <td className="p-4 text-white">{user.email}</td>
                <td className="p-4">
                  <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} className="w-10 h-10 rounded-full border-2 border-white" />
                </td>
                <td className="p-4">
                  <button onClick={() => setUserModal({ show: true, type: 'edit', user })} className="text-blue-500 hover:text-blue-300">
                    Edit
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-500 ml-2 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    
      <div className="mt-4">
        <button onClick={() => setUserModal({ show: true, type: 'add' })} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500">
          Add User
        </button>
      </div>

      {/* User Modal */}
      {userModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-slate-800 p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-white text-lg font-semibold">{userModal.type === 'add' ? 'Add New User' : 'Edit User'}</h3>
            
            <input
              type="text"
              className="p-2 border border-slate-600 bg-slate-700 text-white mt-4 w-full rounded-md"
              value={userModal.user?.first_name || ''}
              onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user!, first_name: e.target.value } })}
              placeholder="First Name"
            />
            <input
              type="text"
              className="p-2 border border-slate-600 bg-slate-700 text-white mt-4 w-full rounded-md"
              value={userModal.user?.last_name || ''}
              onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user!, last_name: e.target.value } })}
              placeholder="Last Name"
            />
            <input
              type="email"
              className="p-2 border border-slate-600 bg-slate-700 text-white mt-4 w-full rounded-md"
              value={userModal.user?.email || ''}
              onChange={(e) => setUserModal({ ...userModal, user: { ...userModal.user!, email: e.target.value } })}
              placeholder="Email"
            />
            
            
            <div className="mt-4">
              <button
                onClick={() => saveUser(userModal.user!)}
                className="bg-blue-600 text-white p-2 rounded-md w-full hover:bg-blue-500"
              >
                {userModal.type === 'add' ? 'Add User' : 'Save Changes'}
              </button>
              <button
                onClick={() => setUserModal({ show: false, type: 'add' })}
                className="bg-red-600 text-white p-2 rounded-md w-full mt-2 hover:bg-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
