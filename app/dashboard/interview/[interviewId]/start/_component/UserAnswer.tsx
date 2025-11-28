import React from 'react'

function UserAnswer() {
  return (
    <div>
                {userAnswer && (
          <div className="mt-4 bg-white border-2 border-blue-300 rounded-lg p-4 w-full text-left shadow-md flex flex-col h-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Your Answer:
            </h3>

            {isEditing ? (
              <>
                <textarea
                  ref={answerTextareaRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                  placeholder="Edit your answer here..."
                  style={{ minHeight: "150px" }}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleSaveAnswer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs rounded font-medium"
                  >
                    ✓ Save Answer
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 text-xs rounded font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md border border-gray-200 mb-2">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {userAnswer}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleEditAnswer}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs rounded font-medium"
                  >
                    ✎ Edit Answer
                  </Button>
                  <Button
                    onClick={handleResetAnswer}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs rounded font-medium"
                  >
                    × Clear Answer
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
    </div>
  )
}

export default UserAnswer