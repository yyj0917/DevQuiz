export function LoadingSpinner() {
  return (
    <div className='mobile-area bg-white/50 fixed top-1/2 left-1/2 flex h-full -translate-x-1/2 -translate-y-1/2 items-center justify-center'>
        <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
  );
}