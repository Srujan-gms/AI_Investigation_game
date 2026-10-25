/**
 * Central State Manager for AI Mystery Room
 */
class StateManager {
  constructor() {
    this.state = {
      activePage: 'landing', // 'landing' | 'new' | 'loading' | 'room' | 'history'
      activeEvidenceTab: 'all',
      mystery: null,
      session: null,
      pinnedEvidence: new Set(),
      notes: localStorage.getItem('detective_notes_cache') || '',
      hintsRemaining: 3,
      hintsHistory: [],
      verdictResult: null,
      user: {
        username: 'Detective (Guest)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        solvedCases: []
      },
      isLoading: false,
      loadingStep: 'Initiating AI Investigation Dossier...'
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  togglePin(evidenceId) {
    const pinned = new Set(this.state.pinnedEvidence);
    if (pinned.has(evidenceId)) {
      pinned.delete(evidenceId);
    } else {
      pinned.add(evidenceId);
    }
    this.setState({ pinnedEvidence: pinned });
  }

  setNotes(notes) {
    localStorage.setItem('detective_notes_cache', notes);
    this.setState({ notes });
  }
}

export const appState = new StateManager();
