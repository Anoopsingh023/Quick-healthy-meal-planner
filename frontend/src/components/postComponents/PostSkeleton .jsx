const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 animate-pulse flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* Image */}
      <div className="w-full h-[300px] bg-gray-300 rounded-lg"></div>

      {/* Actions */}
      <div className="flex gap-4">
        <div className="h-4 w-10 bg-gray-300 rounded"></div>
        <div className="h-4 w-10 bg-gray-300 rounded"></div>
      </div>

      {/* Caption */}
      <div className="h-4 w-full bg-gray-300 rounded"></div>
      <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
    </div>
  );
};