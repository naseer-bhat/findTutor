// src/pages/Admin.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) return navigate("/");

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/teacher`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );

        const studentsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/teacher/getAllPendingStudents`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );

        setTeachers(response.data.data.users || []);
        setStudents(studentsRes.data.data.students || []);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="overflow-x-auto hidden md:block">
        <h2 className="text-xl font-semibold mb-2">Teachers</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Subject</th>
              <th className="py-2 px-4 border">Gender</th>
              <th className="py-2 px-4 border">Experience</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(teachers) &&
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="py-2 px-4 border">{teacher.name || "N/A"}</td>
                  <td className="py-2 px-4 border">{teacher.email || "N/A"}</td>
                  <td className="py-2 px-4 border">
                    {Array.isArray(teacher.subject)
                      ? teacher.subject.join(", ")
                      : teacher.subject || "N/A"}
                  </td>
                  <td className="py-2 px-4 border">{teacher.gender || "N/A"}</td>
                  <td className="py-2 px-4 border">
                    {teacher.experience || "N/A"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden">
        <h2 className="text-xl font-semibold mb-2">Teachers</h2>
        {Array.isArray(teachers) &&
          teachers.map((teacher) => (
            <div key={teacher._id} className="border p-2 mb-2 rounded">
              <p><strong>Name:</strong> {teacher.name || "N/A"}</p>
              <p><strong>Email:</strong> {teacher.email || "N/A"}</p>
              <p><strong>Subject:</strong>{" "}
                {Array.isArray(teacher.subject)
                  ? teacher.subject.join(", ")
                  : teacher.subject || "N/A"}
              </p>
              <p><strong>Gender:</strong> {teacher.gender || "N/A"}</p>
              <p><strong>Experience:</strong> {teacher.experience || "N/A"}</p>
            </div>
          ))}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Pending Students</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(students) &&
          students.map((student) => (
            <div key={student._id} className="border p-4 rounded shadow">
              <p><strong>Name:</strong> {student.name || "N/A"}</p>
              <p><strong>Email:</strong> {student.email || "N/A"}</p>
              <p><strong>Phone:</strong> {student.phone || "N/A"}</p>
              <p><strong>Address:</strong> {student.address || "N/A"}</p>
              <p><strong>Gender:</strong> {student.gender || "N/A"}</p>
              <p><strong>Roles:</strong>{" "}
                {Array.isArray(student.roles)
                  ? student.roles.join(", ")
                  : student.roles || "N/A"}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Admin;
