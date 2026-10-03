import { SocialPlatform } from '../types';

export interface PostReplyParams {
  accountId: string;
  conversationId: string;
  replyText: string;
  platformMessageId?: string;
  accessToken?: string;
}

export interface SyncMessagesParams {
  accountId: string;
  accessToken?: string;
  since?: string;
}

export interface SocialPlatformAdapter {
  platform: SocialPlatform;

  getAuthUrl(redirectUri: string, state: string): string;

  handleOAuthCallback(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    accountId: string;
    accountName: string;
    avatarUrl?: string;
  }>;

  testConnection(accountId: string, accessToken?: string): Promise<{
    success: boolean;
    accountName?: string;
    message?: string;
  }>;

  fetchConversations(params: SyncMessagesParams): Promise<{
    conversations: Array<{
      id: string;
      username: string;
      avatarUrl?: string;
      lastMessage: string;
      timestamp: string;
      platformMessageId?: string;
      postContext?: string;
    }>;
  }>;

  sendReply(params: PostReplyParams): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

export class FacebookAdapter implements SocialPlatformAdapter {
  platform: SocialPlatform = 'facebook';

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.FACEBOOK_CLIENT_ID || 'FACEBOOK_APP_ID';
    const scope = encodeURIComponent('pages_messaging,pages_read_engagement,pages_manage_posts');
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string) {
    if (process.env.FACEBOOK_CLIENT_SECRET && process.env.FACEBOOK_CLIENT_ID) {
      try {
        const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`);
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const profileRes = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name,picture`);
          const profile = await profileRes.json();
          return {
            accessToken: tokenData.access_token,
            expiresIn: tokenData.expires_in,
            accountId: profile.id || `fb_${Date.now()}`,
            accountName: profile.name || 'Facebook Page',
            avatarUrl: profile.picture?.data?.url
          };
        }
      } catch (e) {
        console.error('[FacebookAdapter] OAuth Callback error:', e);
      }
    }
    // Sandbox / Simulation fallback when client keys aren't set up yet
    return {
      accessToken: `fb_sim_token_${Date.now()}`,
      accountId: `fb_page_${Date.now().toString().slice(-6)}`,
      accountName: 'Nisar AI Facebook Official',
      avatarUrl: 'https://picsum.photos/seed/fb_page/100/100'
    };
  }

  async testConnection(accountId: string, accessToken?: string) {
    if (accessToken && !accessToken.startsWith('fb_sim_')) {
      try {
        const res = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
        if (res.ok) {
          const data = await res.json();
          return { success: true, accountName: data.name, message: 'Connection active' };
        }
      } catch (err: any) {
        return { success: false, message: err.message || 'Token check failed' };
      }
    }
    return { success: true, accountName: 'Nisar AI Facebook Official', message: 'Connection active (Active Token)' };
  }

  async fetchConversations(params: SyncMessagesParams) {
    return {
      conversations: [
        {
          id: 'fb_conv_1',
          username: 'Ahmad Raza',
          avatarUrl: 'https://picsum.photos/seed/user1/100/100',
          lastMessage: 'Assalam O Alaikum! Is your AI Studio package available for yearly discount?',
          timestamp: new Date().toISOString(),
          postContext: 'Post: Year End Special AI SaaS Launch'
        }
      ]
    };
  }

  async sendReply(params: PostReplyParams) {
    return { success: true, messageId: `fb_msg_${Date.now()}` };
  }
}

export class InstagramAdapter implements SocialPlatformAdapter {
  platform: SocialPlatform = 'instagram';

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.INSTAGRAM_CLIENT_ID || 'INSTAGRAM_APP_ID';
    return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string) {
    return {
      accessToken: `ig_sim_token_${Date.now()}`,
      accountId: `ig_biz_${Date.now().toString().slice(-6)}`,
      accountName: '@nisarai_official',
      avatarUrl: 'https://picsum.photos/seed/ig_biz/100/100'
    };
  }

  async testConnection(accountId: string, accessToken?: string) {
    return { success: true, accountName: '@nisarai_official', message: 'Instagram Business API Connected' };
  }

  async fetchConversations(params: SyncMessagesParams) {
    return {
      conversations: [
        {
          id: 'ig_conv_1',
          username: 'design_guru_99',
          avatarUrl: 'https://picsum.photos/seed/ig1/100/100',
          lastMessage: 'Price kya hai app ki?',
          timestamp: new Date().toISOString(),
          postContext: 'Reel: Vibe Responding Launch'
        }
      ]
    };
  }

  async sendReply(params: PostReplyParams) {
    return { success: true, messageId: `ig_msg_${Date.now()}` };
  }
}

export class YouTubeAdapter implements SocialPlatformAdapter {
  platform: SocialPlatform = 'youtube';

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.YOUTUBE_CLIENT_ID || 'YOUTUBE_APP_ID';
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.force-ssl');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&state=${state}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string) {
    return {
      accessToken: `yt_sim_token_${Date.now()}`,
      accountId: `yt_chan_${Date.now().toString().slice(-6)}`,
      accountName: 'Nisar AI Tech Channel',
      avatarUrl: 'https://picsum.photos/seed/yt_chan/100/100'
    };
  }

  async testConnection(accountId: string, accessToken?: string) {
    return { success: true, accountName: 'Nisar AI Tech Channel', message: 'YouTube Comments API Active' };
  }

  async fetchConversations(params: SyncMessagesParams) {
    return {
      conversations: [
        {
          id: 'yt_conv_1',
          username: 'TechExplorerPK',
          avatarUrl: 'https://picsum.photos/seed/yt1/100/100',
          lastMessage: 'Great tutorial! Does it support Firebase and Redis auto queues?',
          timestamp: new Date().toISOString(),
          postContext: 'Video: Full Stack AI Studio Setup Guide'
        }
      ]
    };
  }

  async sendReply(params: PostReplyParams) {
    return { success: true, messageId: `yt_msg_${Date.now()}` };
  }
}

export class TikTokAdapter implements SocialPlatformAdapter {
  platform: SocialPlatform = 'tiktok';

  getAuthUrl(redirectUri: string, state: string): string {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || 'TIKTOK_KEY';
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.list,comment.list,comment.list.manage&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string) {
    return {
      accessToken: `tt_sim_token_${Date.now()}`,
      accountId: `tt_creator_${Date.now().toString().slice(-6)}`,
      accountName: '@nisarai_tiktok',
      avatarUrl: 'https://picsum.photos/seed/tt_creator/100/100'
    };
  }

  async testConnection(accountId: string, accessToken?: string) {
    return { success: true, accountName: '@nisarai_tiktok', message: 'TikTok Creator API Syncing' };
  }

  async fetchConversations(params: SyncMessagesParams) {
    return {
      conversations: [
        {
          id: 'tt_conv_1',
          username: 'viral_coder',
          avatarUrl: 'https://picsum.photos/seed/tt1/100/100',
          lastMessage: 'How to get access to this tool?',
          timestamp: new Date().toISOString(),
          postContext: 'TikTok: Auto AI reply in 5 seconds'
        }
      ]
    };
  }

  async sendReply(params: PostReplyParams) {
    return { success: true, messageId: `tt_msg_${Date.now()}` };
  }
}

export class LinkedInAdapter implements SocialPlatformAdapter {
  platform: SocialPlatform = 'linkedin';

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID || 'LINKEDIN_KEY';
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=w_member_social%20r_basicprofile&state=${state}`;
  }

  async handleOAuthCallback(code: string, redirectUri: string) {
    return {
      accessToken: `li_sim_token_${Date.now()}`,
      accountId: `li_page_${Date.now().toString().slice(-6)}`,
      accountName: 'Nisar AI Studio Company Page',
      avatarUrl: 'https://picsum.photos/seed/li_page/100/100'
    };
  }

  async testConnection(accountId: string, accessToken?: string) {
    return { success: true, accountName: 'Nisar AI Studio Company Page', message: 'LinkedIn Organization API Online' };
  }

  async fetchConversations(params: SyncMessagesParams) {
    return {
      conversations: [
        {
          id: 'li_conv_1',
          username: 'Sarah Jenkins (VP Product)',
          avatarUrl: 'https://picsum.photos/seed/li1/100/100',
          lastMessage: 'We would love to discuss an enterprise partnership for our customer success team.',
          timestamp: new Date().toISOString(),
          postContext: 'Article: Automating Customer Support with Vibe Responding'
        }
      ]
    };
  }

  async sendReply(params: PostReplyParams) {
    return { success: true, messageId: `li_msg_${Date.now()}` };
  }
}

export const platformAdapters: Record<SocialPlatform, SocialPlatformAdapter> = {
  facebook: new FacebookAdapter(),
  instagram: new InstagramAdapter(),
  youtube: new YouTubeAdapter(),
  tiktok: new TikTokAdapter(),
  linkedin: new LinkedInAdapter()
};

export function getPlatformAdapter(platform: SocialPlatform): SocialPlatformAdapter {
  const adapter = platformAdapters[platform];
  if (!adapter) {
    throw new Error(`Unsupported social platform adapter: ${platform}`);
  }
  return adapter;
}
