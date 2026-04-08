import Footer from '../components/Footer';

const NotFoundPage = () => {
  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFoundPage;
