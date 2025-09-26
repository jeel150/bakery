import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/course.css';
import { API_BASE_URL } from '../config/api.js';
const Course = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          setCourses([]);
        }
      } catch (e) {
        console.error('Failed to fetch courses', e);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="course-page">
      <Navbar />

      <div className="rb-breadcrumb">
        <span
          className="rb-breadcrumb-home"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          Home
        </span>
        <span className="rb-breadcrumb-separator">&#8250;</span>
        <span className="rb-breadcrumb-link">Baking Classes</span>
      </div>

      <hr className="custom-hr-1" />
      <div className="rb-header-section">
        <h1 className="rb-heading">WANT TO BAKE ON YOUR OWN?</h1>
        <p className="rb-desc">
          Ribbons & Balloons provides baking & decorating courses in Dubai. Whether it’s baking or
          decorating, our experienced chefs are ready for all levels. See if there is a baking course
          that’s perfect for your hobby or your career below. You can buy the course for yourself or
          gift the course to your loved ones!
        </p>
      </div>
      <hr className="custom-hr-2" />

      <span className="rb-course-count">
        {loading
          ? 'Loading…'
          : courses.length > 0
          ? `${courses.length} workshop & courses`
          : 'No courses available'}
      </span>

      <div className="rb-courses-section">
        <aside className="rb-sidebar">
          <h2>Workshops & Courses</h2>
          <ul>
            <li><hr className="rb-sidebar-hr" /><span>BASIC</span></li>
            <li><hr className="rb-sidebar-hr" /><span>INTERMEDIATE</span></li>
            <li><hr className="rb-sidebar-hr" /><span>ADVANCED</span></li>
            <li><hr className="rb-sidebar-hr" /><span>WORKSHOPS</span></li>
            <li><hr className="rb-sidebar-hr" /><span>KIDS WORKSHOPS</span><hr className="rb-sidebar-hr" /></li>
          </ul>
        </aside>

        <main className="rb-courses-grid">
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
              Loading courses…
            </div>
          ) : courses.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
              No courses available
            </div>
          ) : (
            courses.slice(0, 9).map((course) => (
              <div key={course._id} className="rb-course-card">
                <div className="rb-course-badge">
                  <span>{course.label || 'Course'}</span>
                  <span>{course.days || ''}</span>
                </div>
                <img src={course.image} alt={course.title} className="rb-course-img" />
                <h3>{course.title}</h3>
                <p>
                  {course.description && course.description.length > 100 
                    ? `${course.description.substring(0, 100)}...` 
                    : course.description
                  }
                </p>
                <button
                  className="rb-btn-view"
                  onClick={() => navigate(`/viewcourse`)}
                >
                  {course.buttonText || 'View Course ➜'}
                </button>
              </div>
            ))
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Course;