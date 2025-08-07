import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdDelete, MdAdd } from "react-icons/md";

const Admin = () => {
  const [teachers, setTeachers] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    subject: "",
    age: "",
  });
  const navigate = useNavigate();

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/teachers`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setTeachers(response.data.data.users || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to fetch teachers");
    }
  };

  // Fetch all students pending admin approval
  const fetchPendingStudents = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/pending-students`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      setPendingStudents(response.data.data.students || []);
    } catch (error) {
      console.error("Error fetching pending students:", error);
      toast.error("Failed to fetch pending students");
    }
  };

  // Approve a pending student (with email confirmation)
  const approveStudent = async (studentId) => {
    try {
      setLoading(true);
      const jwtToken = localStorage.getItem("jwtToken");
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/students/${studentId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      toast.success("Student approved successfully");
      fetchPendingStudents(); // Refresh list
    } catch (error) {
      console.error("Error approving student:", error);
      toast.error(error.response?.data?.message || "Failed to approve student");
    } finally {
      setLoading(false);
      setShowApproveModal(false);
      setCurrentStudent(null);
    }
  };

  // Delete a pending student
  const deleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      setLoading(true);
      const jwtToken = localStorage.getItem("jwtToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/students/${studentId}`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      toast.success("Student deleted successfully");
      fetchPendingStudents(); // Refresh list
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  // Add a new teacher
  const addTeacher = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const jwtToken = localStorage.getItem("jwtToken");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/teachers`,
        teacherForm,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      toast.success("Teacher added successfully");
      setShowAddTeacherModal(false);
      setTeacherForm({
        name: "",
        email: "",
        password: "",
        department: "",
        subject: "",
        age: "",
      });
      fetchTeachers(); // Refresh list
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error(error.response?.data?.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setTeacherForm({ ...teacherForm, [name]: value });
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) navigate("/");
    else {
      fetchTeachers();
      fetchPendingStudents();
    }
  }, [navigate]);

  return (
    <div className="p-4">
      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen bg-gray-500 bg-opacity-90">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium mb-4">Add Teacher</h3>
              <form onSubmit={addTeacher} className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={teacherForm.name}
                  onChange={handleInput}
                  placeholder="Name"
                  required
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleInput}
                  placeholder="Email"
                  required
                  className="w-full p-2 border rounded"
                />
                <input
                  type="password"
                  name="password"
                  value={teacherForm.password}
                  onChange={handleInput}
                  placeholder="Password"
                  required
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="department"
                  value={teacherForm.department}
                  onChange={handleInput}
                  placeholder="Department"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="subject"
                  value={teacherForm.subject}
                  onChange={handleInput}
                  placeholder="Subject"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  name="age"
                  value={teacherForm.age}
                  onChange={handleInput}
                  placeholder="Age"
                  className="w-full p-2 border rounded"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-1/2"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Teacher"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTeacherModal(false)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 w-1/2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approve Student Confirmation Modal */}
      {showApproveModal && currentStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen bg-gray-500 bg-opacity-90">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium mb-4">Approve Student</h3>
              <p className="mb-4">
                Approve student <strong>{currentStudent.name}</strong> ({currentStudent.email})?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => approveStudent(currentStudent._id)}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600 w-1/2"
                  disabled={loading}
                >
                  {loading ? "Approving..." : "Yes, Approve"}
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setCurrentStudent(null);
                  }}
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 w-1/2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teachers</h2>
        <button
          onClick={() => setShowAddTeacherModal(true)}
          className="bg-blue-500 text-white p-2 rounded flex items-center gap-1 hover:bg-blue-600"
        >
          <MdAdd /> Add Teacher
        </button>
      </div>

      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Subject</th>
              <th className="py-2 px-4 border">Department</th>
              <th className="py-2 px-4 border">Age</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(teachers) &&
              teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="py-2 px-4 border">{teacher.name || "N/A"}</td>
                  <td className="py-2 px-4 border">{teacher.email || "N/A"}</td>
                  <td className="py-2 px-4 border">{teacher.subject || "N/A"}</td>
                  <td className="py-2 px-4 border">{teacher.department || "N/A"}</td>
                  <td className="py-2 px-4 border">{teacher.age || "N/A"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden mt-4">
        <h2 className="text-xl font-semibold mb-2">Teachers (Mobile)</h2>
        {Array.isArray(teachers) &&
          teachers.map((teacher) => (
            <div key={teacher._id} className="border p-4 mb-4 rounded-lg shadow">
              <p><strong>Name:</strong> {teacher.name || "N/A"}</p>
              <p><strong>Email:</strong> {teacher.email || "N/A"}</p>
              <p><strong>Subject:</strong> {teacher.subject || "N/A"}</p>
              <p><strong>Department:</strong> {teacher.department || "N/A"}</p>
              <p><strong>Age:</strong> {teacher.age || "N/A"}</p>
            </div>
          ))}
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Pending Students</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(pendingStudents) && pendingStudents.length > 0 ? (
          pendingStudents.map((student) => (
            <div key={student._id} className="border p-4 rounded shadow bg-white">
              <p><strong>Name:</strong> {student.name || "N/A"}</p>
              <p><strong>Email:</strong> {student.email || "N/A"}</p>
              <p><strong>Department:</strong> {student.department || "N/A"}</p>
              <p><strong>Age:</strong> {student.age || "N/A"}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setCurrentStudent(student);
                    setShowApproveModal(true);
                  }}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex-1"
                >
                  Approve
                </button>
                <button
                  onClick={() => deleteStudent(student._id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center justify-center gap-1 flex-1"
                  disabled={loading}
                >
                  <MdDelete /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No pending students.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
