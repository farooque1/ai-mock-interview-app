/**
 * Reusable Components & Hooks - Quick Reference
 * 
 * Copy-paste snippets for common use cases
 */

// ============================================================================
// UI COMPONENTS - QUICK IMPORTS
// ============================================================================

// import {
//   Loader, LoadingState, SkeletonLoader,
//   Card, CardHeader, CardContent, CardFooter,
//   Modal, ConfirmDialog,
//   ProgressBar, CircularProgress, StepIndicator,
//   SuccessMessage, ErrorMessage, WarningMessage, InfoMessage,
//   Container, Section, Grid,
//   EmptyState, Badge, Divider
// } from '@/app/components/SharedComponents';

// ============================================================================
// HOOKS - QUICK IMPORTS
// ============================================================================

// import {
//   useTimer, useDebounce, useLocalStorage, usePrevious,
//   useAsync, useBoolean, useArray, useObject, useForm,
//   useClickOutside, useCopyToClipboard, useMediaQuery,
//   useWindowSize, useFetch
// } from '@/app/hooks';

// import { useQuery, useMutation, useCachedQuery } from '@/app/utils/api.helpers';

// ============================================================================
// PATTERN 1: LOADING LIST
// ============================================================================

// const MyListComponent = () => {
//   const { data, loading, error } = useQuery<Item[]>('/api/items');
//
//   if (loading) return <LoadingState message="Loading items..." />;
//   if (error) return <ErrorMessage message={error.message} />;
//   if (!data?.length) return <EmptyState title="No items" />;
//
//   return (
//     <Grid columns={2}>
//       {data.map(item => (
//         <Card key={item.id}>
//           <CardContent>{item.name}</CardContent>
//         </Card>
//       ))}
//     </Grid>
//   );
// };

// ============================================================================
// PATTERN 2: FORM WITH SUBMISSION
// ============================================================================

// const MyFormComponent = () => {
//   const { values, handleChange, handleSubmit, isSubmitting } = useForm(
//     { name: '', email: '' },
//     async (data) => {
//       await mutate(data);
//     }
//   );
//
//   const { mutate, loading, error } = useMutation('/api/submit', { method: 'POST' });
//
//   return (
//     <form onSubmit={handleSubmit}>
//       <input name="name" value={values.name} onChange={handleChange} />
//       <input name="email" value={values.email} onChange={handleChange} />
//       {error && <ErrorMessage message={error.message} />}
//       <button disabled={loading} type="submit">Submit</button>
//     </form>
//   );
// };

// ============================================================================
// PATTERN 3: TIMER WITH PROGRESS
// ============================================================================

// const TimerComponent = () => {
//   const { seconds, isRunning, start, stop, reset, progress } = useTimer(300);
//
//   return (
//     <Card>
//       <CardContent className="space-y-4">
//         <CircularProgress percentage={progress * 100} label={`${seconds}s`} />
//         <div className="flex gap-2">
//           <button onClick={start}>Start</button>
//           <button onClick={stop}>Stop</button>
//           <button onClick={reset}>Reset</button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// ============================================================================
// PATTERN 4: MODAL FORM
// ============================================================================

// const ModalFormComponent = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { values, handleChange, handleSubmit } = useForm(
//     { title: '' },
//     async (data) => await mutate(data)
//   );
//   const { mutate, loading, error } = useMutation('/api/create', { method: 'POST' });
//
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>Open Modal</button>
//       <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create">
//         <form onSubmit={handleSubmit}>
//           <input name="title" value={values.title} onChange={handleChange} />
//           {error && <ErrorMessage message={error.message} />}
//           <CardFooter>
//             <button type="submit" disabled={loading}>Save</button>
//           </CardFooter>
//         </form>
//       </Modal>
//     </>
//   );
// };

// ============================================================================
// PATTERN 5: CONFIRMATION DIALOG
// ============================================================================

// const ConfirmComponent = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { mutate, loading } = useMutation('/api/delete', { method: 'DELETE' });
//
//   const handleConfirm = async () => {
//     await mutate({ id: itemId });
//     setIsOpen(false);
//   };
//
//   return (
//     <>
//       <button onClick={() => setIsOpen(true)}>Delete</button>
//       <ConfirmDialog
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         title="Delete Item?"
//         message="This cannot be undone"
//         onConfirm={handleConfirm}
//         isDangerous
//       />
//     </>
//   );
// };

// ============================================================================
// PATTERN 6: SEARCH WITH DEBOUNCE
// ============================================================================

// const SearchComponent = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const debouncedTerm = useDebounce(searchTerm, 500);
//   const { data: results } = useQuery(`/api/search?q=${debouncedTerm}`, {
//     enabled: !!debouncedTerm
//   });
//
//   return (
//     <div>
//       <input
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         placeholder="Search..."
//       />
//       {results?.map(item => <div key={item.id}>{item.name}</div>)}
//     </div>
//   );
// };

// ============================================================================
// PATTERN 7: MULTI-STEP FORM
// ============================================================================

// const MultiStepFormComponent = () => {
//   const [step, setStep] = useState(0);
//   const { values, handleChange, handleSubmit } = useForm(
//     { firstName: '', lastName: '', email: '' },
//     async (data) => await mutate(data)
//   );
//   const { mutate, loading } = useMutation('/api/register', { method: 'POST' });
//
//   return (
//     <Card>
//       <CardHeader title={`Step ${step + 1} of 3`} />
//       <StepIndicator steps={['Personal', 'Contact', 'Confirm']} currentStep={step} />
//       <CardContent>
//         {step === 0 && (
//           <>
//             <input name="firstName" value={values.firstName} onChange={handleChange} />
//             <input name="lastName" value={values.lastName} onChange={handleChange} />
//           </>
//         )}
//         {step === 1 && (
//           <input name="email" value={values.email} onChange={handleChange} />
//         )}
//       </CardContent>
//       <CardFooter>
//         <button onClick={() => setStep(step - 1)} disabled={step === 0}>Back</button>
//         {step < 2 ? (
//           <button onClick={() => setStep(step + 1)}>Next</button>
//         ) : (
//           <button onClick={handleSubmit} disabled={loading}>Submit</button>
//         )}
//       </CardFooter>
//     </Card>
//   );
// };

// ============================================================================
// PATTERN 8: EDITABLE TABLE
// ============================================================================

// const EditableTable = () => {
//   const [rows, setRows] = useArray<TableRow>([]);
//   const { mutate } = useMutation('/api/rows', { method: 'PUT' });
//
//   const handleEdit = async (id: string, newData: Partial<TableRow>) => {
//     await mutate({ id, ...newData });
//     // Refetch or update local state
//   };
//
//   return (
//     <table>
//       <tbody>
//         {rows.array.map((row, i) => (
//           <tr key={i}>
//             <td>{row.name}</td>
//             <td>
//               <button onClick={() => rows.remove(i)}>Delete</button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// ============================================================================
// PATTERN 9: RESPONSIVE LAYOUT
// ============================================================================

// const ResponsiveComponent = () => {
//   const isMobile = useMediaQuery('(max-width: 768px)');
//   const { width, height } = useWindowSize();
//
//   return (
//     <Container size={isMobile ? 'sm' : 'lg'}>
//       {isMobile ? <MobileLayout /> : <DesktopLayout />}
//     </Container>
//   );
// };

// ============================================================================
// PATTERN 10: BATCH API CALLS
// ============================================================================

// const BatchFetchComponent = () => {
//   const [data, setData] = useState(null);
//   const { execute, loading } = useAsync(async () => {
//     const [users, posts, comments] = await batchRequests([
//       () => apiGet('/api/users'),
//       () => apiGet('/api/posts'),
//       () => apiGet('/api/comments'),
//     ]);
//     setData({ users, posts, comments });
//   });
//
//   if (loading) return <LoadingState />;
//   return <div>{/* Render data */}</div>;
// };

// ============================================================================
// PATTERN 11: LOCAL STORAGE WITH FORM
// ============================================================================

// const FormWithPersistence = () => {
//   const [formData, setFormData] = useLocalStorage('interviewForm', {
//     title: '',
//     position: '',
//   });
//
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };
//
//   return (
//     <form>
//       <input
//         name="title"
//         value={formData.title}
//         onChange={handleChange}
//       />
//       <input
//         name="position"
//         value={formData.position}
//         onChange={handleChange}
//       />
//     </form>
//   );
// };

// ============================================================================
// PATTERN 12: DROPDOWN WITH CLICK OUTSIDE
// ============================================================================

// const Dropdown = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
//
//   return (
//     <div ref={ref}>
//       <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
//       {isOpen && (
//         <div className="absolute">
//           <a href="#1">Option 1</a>
//           <a href="#2">Option 2</a>
//         </div>
//       )}
//     </div>
//   );
// };

// ============================================================================
// PATTERN 13: SHAREABLE CONTENT
// ============================================================================

// const ShareableComponent = () => {
//   const { copy, isCopied } = useCopyToClipboard();
//
//   const handleShare = async () => {
//     const url = `${window.location.origin}/interviews/${interviewId}`;
//     await copy(url);
//   };
//
//   return (
//     <button onClick={handleShare}>
//       {isCopied ? 'Copied!' : 'Share'}
//     </button>
//   );
// };

// ============================================================================
// PATTERN 14: ERROR RECOVERY
// ============================================================================

// const ResilientComponent = () => {
//   const [retryCount, setRetryCount] = useState(0);
//   const { data, error, execute } = useAsync(
//     () => apiGet('/api/unreliable-endpoint'),
//     true
//   );
//
//   const handleRetry = async () => {
//     setRetryCount(r => r + 1);
//     await execute();
//   };
//
//   return (
//     <>
//       {error && (
//         <ErrorMessage
//           message={`Failed (attempt ${retryCount})`}
//           onClose={handleRetry}
//         />
//       )}
//     </>
//   );
// };

// ============================================================================
// PATTERN 15: REAL-TIME UPDATES
// ============================================================================

// const RealTimeComponent = () => {
//   const { data: items, refetch } = useQuery<Item[]>('/api/items', {
//     refetchInterval: 5000, // Refetch every 5 seconds
//     onSuccess: (data) => {
//       // Optional: Handle new data
//     },
//   });
//
//   const handleManualRefresh = () => refetch();
//
//   return (
//     <>
//       <button onClick={handleManualRefresh}>Refresh Now</button>
//       {/* Display items */}
//     </>
//   );
// };

// ============================================================================
// HELPER SNIPPETS
// ============================================================================

// Check if data is loading
// const isLoading = loading || !data;

// Format time display
// const formatTime = (seconds: number) => {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins}:${String(secs).padStart(2, '0')}`;
// };

// Get error message safely
// const errorMsg = error instanceof Error ? error.message : 'Unknown error';

// Check if mutation succeeded
// const wasSuccessful = !loading && !error && data;

// Combine multiple useObject states
// const { object: formState, merge: updateForm } = useObject({
//   personal: { name: '' },
//   contact: { email: '' },
// });

// Array with filter by property
// const { filter } = useArray(data);
// filter(item => item.status === 'active');
