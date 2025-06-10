import Link from 'next/link';


export default function Navbar() {

  const toggleMenu = () => {

  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Kitchen Stock Manager
        </Link>
        <button onClick={toggleMenu} className="md:hidden">

        </button>
        <div className={`md:flex ${isOpen ? 'block' : 'hidden'}`}>
          <Link href="/" className="px-4 py-2 hover:bg-gray-700">
            Home
          </Link>
          <Link href="/order" className="px-4 py-2 hover:bg-gray-700">
            Order Pages
          </Link>
        </div>
      </div>
    </nav>
  );
}