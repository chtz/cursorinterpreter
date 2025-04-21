function Home() {
  return (
    <div className="text-center py-10">
      <h2 className="text-3xl font-bold mb-4">Welcome to Cursor Interpreter SPA</h2>
      <p className="text-lg mb-6">
        This is a simple Single Page Application built with React, React Router, and Tailwind CSS.
      </p>
      <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <p className="mb-4">
          This project demonstrates a basic layout structure with:
        </p>
        <ul className="list-disc text-left pl-10 mb-4">
          <li>Header with title</li>
          <li>Content area with React Router</li>
          <li>Footer with copyright information</li>
          <li>Responsive design using Tailwind CSS</li>
        </ul>
      </div>
    </div>
  );
}

export default Home; 