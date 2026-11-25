import Hero from './hero/Hero';
import Idea from './sections/Idea';
import Process from './sections/Process';
import Join from './sections/Join';
import './sections/sections.css';

export default function App() {
  return (
    <main>
      <Hero />
      {/* Parte 1: qué es y quiénes */}
      <Idea />
      {/* Parte 2: cómo se cambia, poco a poco */}
      <Process />
      <Join />
    </main>
  );
}
