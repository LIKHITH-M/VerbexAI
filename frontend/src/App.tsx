import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import type { PageId } from './types.ts';
import { useFetch } from './hooks/useFetch';

// Page imports
import ManagerView from './pages/ManagerView';
import AllMeetings from './pages/AllMeetings';
import TaskBoard from './pages/TaskBoard';
import DecisionLog from './pages/DecisionLog';
import SpeakerMap from './pages/SpeakerMap';
import StaleTasks from './pages/StaleTasks';
import NewMeeting from './pages/NewMeeting';
import EmployeeManager from './pages/EmployeeManager';

function App() {
  const [activePage, setActivePage] = useState<PageId>('manager');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { data: stats } = useFetch<any>('/meetings/stats');

  const staleCount = stats?.stale_tasks?.value || 0;

  const handleMeetingClick = () => {
    // Navigate to Task Board for now
    setActivePage('tasks');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'manager': return <ManagerView />;
      case 'meetings': return <AllMeetings onMeetingClick={handleMeetingClick} />;
      case 'tasks': return <TaskBoard />;
      case 'decisions': return <DecisionLog />;
      case 'speakers': return <SpeakerMap />;
      case 'stale': return <StaleTasks />;
      case 'ingest': return <NewMeeting />;
      case 'employees': return <EmployeeManager />;
      default: return <ManagerView />;
    }
  };

  return (
    <div className={`min-h-screen bg-background text-text selection:bg-accent-teal/10 selection:text-accent-teal ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        staleCount={staleCount}
      />
      
      <main className={`transition-all duration-300 pt-[56px] min-h-screen ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[240px]'}`}>
        <Topbar activePage={activePage} />
        <div className="max-w-[1400px] mx-auto animate-fadeIn px-4 md:px-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
