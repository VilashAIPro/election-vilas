/**
 * VoteIQ Gamification — Achievement & Badge System
 * Tracks user milestones and rewards progress.
 */

const BADGES = {
  EXPLORER: { id: 'explorer', name: 'Process Explorer', icon: '🔍', desc: 'Explored all 8 steps of the election timeline.' },
  SCHOLAR: { id: 'scholar', name: 'Quiz Scholar', icon: '🎓', desc: 'Completed the election quiz with a perfect score.' },
  CITIZEN: { id: 'citizen', name: 'Ready Citizen', icon: '🇮🇳', desc: 'Completed the full voter readiness checklist.' },
  CONTRIBUTOR: { id: 'contributor', name: 'Feedback Star', icon: '⭐', desc: 'Shared feedback to help improve the platform.' }
};

export const BadgeService = {
  /**
   * Unlocks a badge for the user if they haven't earned it yet.
   * @param {string} badgeKey - Key from BADGES object.
   */
  async unlock(badgeKey) {
    const badge = BADGES[badgeKey];
    if (!badge) return;

    const earned = JSON.parse(localStorage.getItem('voteiq_badges') || '[]');
    if (earned.includes(badge.id)) return;

    earned.push(badge.id);
    localStorage.setItem('voteiq_badges', JSON.stringify(earned));

    // Show a notification toast
    this.showToast(badge);

    // If logged in, sync with Firestore
    if (window.VoteIQBackend?.AuthService.currentUser()) {
      const uid = window.VoteIQBackend.AuthService.currentUser().uid;
      const ref = window.VoteIQBackend.DataService.dbDoc('users', uid);
      await window.VoteIQBackend.DataService.updateDoc(ref, { badges: earned });
    }
  },

  /** Displays a premium toast notification for the earned badge. */
  showToast(badge) {
    const toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML = `
      <div class="toast-icon">${badge.icon}</div>
      <div class="toast-content">
        <div class="toast-title">Badge Earned!</div>
        <div class="toast-name">${badge.name}</div>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('visible'), 100);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  },

  /** Returns all earned badges. */
  getEarned() {
    return JSON.parse(localStorage.getItem('voteiq_badges') || '[]');
  },

  /** Renders the badge collection in the UI. */
  renderCollection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const earned = this.getEarned();
    container.innerHTML = '';

    Object.values(BADGES).forEach(badge => {
      const isEarned = earned.includes(badge.id);
      const el = document.createElement('div');
      el.className = `badge-item ${isEarned ? 'earned' : 'locked'}`;
      el.innerHTML = `
        <div class="badge-icon">${isEarned ? badge.icon : '🔒'}</div>
        <div class="badge-info">
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
      `;
      container.appendChild(el);
    });
  }
};

window.BadgeService = BadgeService;
