export default function Loader() {
    return (
      <>
        <div className="loader">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
  
        <style jsx>{`
          .loader {
            display: flex;
            align-items: center;
          }
  
          .bar {
            display: inline-block;
            width: 4px;
            height: 20px;
            background-color: rgba(255, 255, 255, 0.6);
            border-radius: 10px;
            margin: 0 3px;
            animation: scale-up4 1s linear infinite;
          }
  
          .bar:nth-child(2) {
            height: 35px;
            animation-delay: 0.25s;
          }
  
          .bar:nth-child(3) {
            animation-delay: 0.5s;
          }
  
          @keyframes scale-up4 {
            0%, 40%, 100% {
              transform: scaleY(1);
              background-color: rgba(255, 255, 255, 0.6);
            }
            20% {
              transform: scaleY(1.5);
              background-color: #fff;
            }
          }
        `}</style>
      </>
    );
  }
  