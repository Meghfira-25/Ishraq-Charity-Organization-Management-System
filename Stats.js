import { useEffect, useState } from "react";
import "./stats.css";

function Counter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 20);

    const timer = setInterval(() => {
      start += increment;

      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}+</span>;
}

export default function Stats() {
  return (
    <section className="stats-section">



      <div className="stat">
        <i class="fa-solid fa-users"></i>
        <h2>
          <Counter target={1000} />
        </h2>
        <p>families supported</p>
      </div>

      <div className="stat">
        <i class="fa-solid fa-user-graduate"></i>
        <h2>
          <Counter target={500} />
        </h2>
        <p>students sponsored</p>
      </div>

      <div className="stat">
        <i class="fa-solid fa-hand-holding-heart"></i>
        <h2>
          <Counter target={50} />
        </h2>
        <p>members</p>
      </div>

      <div className="stat">
        <i class="fa-solid fa-globe"></i>
        <h2>
          <Counter target={50} />
        </h2>
        <p>programs</p>
      </div>
    </section>
  );
}