import axios from 'axios';

interface SAIDIdentity {
  agentId: string;
  name: string;
  reputation: number;
  verified: boolean;
  badges: string[];
  createdAt: string;
}

interface SAIDVerificationResult {
  isVerified: boolean;
  identity?: SAIDIdentity;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class SAIDClient {
  private apiUrl: string;

  constructor(apiUrl: string = 'https://api.said.protocol') {
    this.apiUrl = apiUrl;
  }

  /**
   * Verify an agent's identity by their SAID
   */
  async verifyAgent(said: string): Promise<SAIDVerificationResult> {
    try {
      const response = await axios.get(`${this.apiUrl}/verify/${said}`, {
        timeout: 10000,
      });

      const identity: SAIDIdentity = response.data;
      
      return {
        isVerified: identity.verified,
        identity,
        trustScore: this.calculateTrustScore(identity),
        riskLevel: this.assessRisk(identity),
      };
    } catch (error) {
      console.error('SAID verification failed:', error);
      return {
        isVerified: false,
        trustScore: 0,
        riskLevel: 'high',
      };
    }
  }

  /**
   * Verify a wallet address reputation
   */
  async verifyWallet(walletAddress: string): Promise<SAIDVerificationResult> {
    try {
      const response = await axios.get(`${this.apiUrl}/wallet/${walletAddress}`, {
        timeout: 10000,
      });

      return {
        isVerified: response.data.verified,
        identity: response.data.identity,
        trustScore: response.data.score || 0,
        riskLevel: this.mapScoreToRisk(response.data.score),
      };
    } catch (error) {
      console.error('Wallet verification failed:', error);
      return {
        isVerified: false,
        trustScore: 0,
        riskLevel: 'high',
      };
    }
  }

  /**
   * Get trust badge HTML/CSS for UI display
   */
  getTrustBadge(score: number, size: 'sm' | 'md' | 'lg' = 'md'): string {
    const colors = this.getScoreColor(score);
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return `
      <span class="${sizes[size]} ${colors.bg} ${colors.text} rounded-full font-medium inline-flex items-center gap-1">
        ${colors.icon} ${score}/1000
      </span>
    `;
  }

  /**
   * Calculate trust score based on identity factors
   */
  private calculateTrustScore(identity: SAIDIdentity): number {
    let score = 0;
    
    // Base score from reputation
    score += identity.reputation * 10;
    
    // Verification bonus
    if (identity.verified) score += 200;
    
    // Badge bonuses
    score += identity.badges.length * 50;
    
    // Age factor (older = more trustworthy)
    const age = Date.now() - new Date(identity.createdAt).getTime();
    const ageDays = age / (1000 * 60 * 60 * 24);
    score += Math.min(ageDays * 2, 100);
    
    return Math.min(Math.round(score), 1000);
  }

  /**
   * Assess risk level based on identity
   */
  private assessRisk(identity: SAIDIdentity): 'low' | 'medium' | 'high' {
    if (!identity.verified) return 'high';
    if (identity.reputation > 80 && identity.badges.length >= 3) return 'low';
    if (identity.reputation > 50) return 'medium';
    return 'high';
  }

  /**
   * Map score to risk level
   */
  private mapScoreToRisk(score: number): 'low' | 'medium' | 'high' {
    if (score >= 700) return 'low';
    if (score >= 400) return 'medium';
    return 'high';
  }

  /**
   * Get color scheme for trust score
   */
  private getScoreColor(score: number) {
    if (score >= 800) {
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '✅' };
    }
    if (score >= 600) {
      return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '✓' };
    }
    if (score >= 400) {
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '⚠️' };
    }
    return { bg: 'bg-red-500/20', text: 'text-red-400', icon: '❌' };
  }
}

export const saidClient = new SAIDClient();
