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
      setTeachers(response.data.data?.users || []);
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
      setPendingStudents(response.data.data?.students || []);
    } catch (error) {
      console.error("Error fetching pending students:", error);
      toast.error("Failed to fetch pending students");
    }
  };

  // Approve a pending student
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
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin`,
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

  // Fetch data on component mount
  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) navigate("/");
    fetchTeachers();
    fetchPendingStudents();
  }, [navigate]);

  return (
    <div className="p-4">
      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen px-4 py-12 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 dark:bg-slate-800 transition-opacity">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Add Teacher
            </h3>
            <form onSubmit={addTeacher} className="space-y-3">
              {[
                { name: "name", type: "text", placeholder: "Name" },
                { name: "email", type: "email", placeholder: "Email" },
                { name: "password", type: "password", placeholder: "Password" },
                { name: "department", type: "text", placeholder: "Department" },
                { name: "subject", type: "text", placeholder: "Subject" },
                { name: "age", type: "number", placeholder: "Age" },
              ].map((field) => (
                <input
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  value={teacherForm[field.name]}
                  onChange={handleInput}
                  placeholder={field.placeholder}
                  required={field.name !== "department" && field.name !== "subject" && field.name !== "age"}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              ))}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-1/2 disabled:opacity-50"
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
      )}

      {/* Approve Student Modal */}
      {showApproveModal && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen px-4 py-12 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 dark:bg-slate-800">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Approve Student
            </h3>
            <p className="mb-4">
              Approve student <strong>{currentStudent.name}</strong> (
              {currentStudent.email})?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => approveStudent(currentStudent._id)}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600 w-1/2 disabled:opacity-50"
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
      )}

      <h1 className="text-2xl font-bold mb-4 dark:text-white">
        Admin Dashboard
      </h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Teachers</h2>
        <button
          onClick={() => setShowAddTeacherModal(true)}
          className="bg-blue-500 text-white p-2 rounded flex items-center gap-1 hover:bg-blue-600"
        >
          <MdAdd /> Add Teacher
        </button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700">
              <th className="py-2 px-4 border dark:border-slate-600">Name</th>
              <th className="py-2 px-4 border dark:border-slate-600">Email</th>
              <th className="py-2 px-4 border dark:border-slate-600">Subject</th>
              <th className="py-2 px-4 border dark:border-slate-600">Department</th>
              <th className="py-2 px-4 border dark:border-slate-600">Age</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-slate-900">
                <td className="py-2 px-4 border dark:border-slate-600">{teacher.name || "N/A"}</td>
                <td className="py-2 px-4 border dark:border-slate-600">{teacher.email || "N/A"}</td>
                <td className="py-2 px-4 border dark:border-slate-600">{teacher.subject || "N/A"}</td>
                <td className="py-2 px-4 border dark:border-slate-600">{teacher.department || "N/A"}</td>
                <td className="py-2 px-4 border dark:border-slate-600">{teacher.age || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden mt-4">
        {teachers.map((teacher) => (
          <div
            key={teacher._id}
            className="border p-4 mb-4 rounded-lg shadow bg-white dark:bg-slate-800"
          >
            <p>
              <strong>Name:</strong> {teacher.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {teacher.email || "N/A"}
            </p>
            <p>
              <strong>Subject:</strong> {teacher.subject || "N/A"}
            </p>
            <p>
              <strong>Department:</strong> {teacher.department || "N/A"}
            </p>
            <p>
              <strong>Age:</strong> {teacher.age || "N/A"}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">
        Pending Students
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingStudents.length > 0 ? (
          pendingStudents.map((student) => (
            <div
              key={student._id}
              className="border p-4 rounded shadow bg-white dark:bg-slate-800"
            >
              <p>
                <strong>Name:</strong> {student.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {student.email || "N/A"}
              </p>
              <p>
                <strong>Department:</strong> {student.department || "N/A"}
              </p>
              <p>
                <strong>Age:</strong> {student.age || "N/A"}
              </p>
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
          <p className="dark:text-white">No pending students.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
