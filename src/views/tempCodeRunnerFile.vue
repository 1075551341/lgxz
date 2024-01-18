function downloadSequentiallyWithPromise(tasks,n = 2) {
  let currentTaskIndex = 0;
  let activeDownloads = 0;

  function downloadNext() {
    if (currentTaskIndex >= tasks.length) {
      return Promise.resolve(); // All tasks completed
    }

    const task = tasks[currentTaskIndex];
    currentTaskIndex++;

    const downloadPromise = task.download();
    activeDownloads++;

    return downloadPromise
      .then(() => {
        activeDownloads--;
        return downloadNext(); // Recursively start next download
      })
      .catch((error) => {
        activeDownloads--;
        throw error;
      });
  }

  const maxConcurrentDownloads = n; // Maximum number of concurrent downloads
  const downloadPromises = [];

  for (let i = 0; i < maxConcurrentDownloads; i++) {
    downloadPromises.push(downloadNext());
  }

  return Promise.all(downloadPromises);
}
