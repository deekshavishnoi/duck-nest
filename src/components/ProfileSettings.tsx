'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { UserProfile } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { User, Mail, Cake, Copy, Check, Link2, LogOut, Heart, Pencil } from 'lucide-react';

export default function ProfileSettings() {
  const {
    data, currentUser, partner, updateProfile, updatePartnerNickname,
    generateInviteCode, logOut, myDisplayName, partnerDisplayName,
  } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyInvite = () => {
    const code = data.invite.code || generateInviteCode();
    const link = `${window.location.origin}?invite=${code}`;
    navigator.clipboard.writeText(`Join our DuckNest! 🦆\n${link}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-amber-900">Our Profiles</h1>
        <p className="text-sm text-amber-600/40 italic">our little world 🦆</p>
      </div>

      {/* My Profile Card */}
      {currentUser && (
        <ProfileCard
          profile={currentUser}
          resolvedDisplayName={myDisplayName}
          partnerNicknameForMe={partner?.partnerNickname}
          index={0}
          isOwn={true}
          onUpdate={updateProfile}
        />
      )}

      {/* Partner Profile Card + Nickname */}
      {partner && (
        <div className="space-y-3">
          <ProfileCard
            profile={partner}
            resolvedDisplayName={partnerDisplayName}
            index={1}
            isOwn={false}
            onUpdate={updateProfile}
          />
          <NicknameEditor
            currentNickname={currentUser?.partnerNickname || ''}
            partnerName={partner.name}
            onSave={updatePartnerNickname}
          />
        </div>
      )}

      {!partner && (
        <div className="duck-card p-5 text-center">
          <p className="text-4xl mb-2">🐤</p>
          <p className="text-sm text-amber-600/50">Your partner hasn&apos;t joined yet.</p>
          <p className="text-xs text-amber-400 mt-1">Share your invite code below!</p>
        </div>
      )}

      {/* Invite Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="duck-card p-5"
      >
        <h2 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-amber-500" />
          Invite Link
        </h2>
        <p className="text-xs text-amber-600/50 mb-3">
          Share this code with your partner to link your dashboards together.
        </p>
        {data.invite.code && (
          <div className="bg-amber-50 rounded-xl px-4 py-2 text-center mb-3 border border-amber-200">
            <span className="font-mono text-lg font-bold text-amber-800 tracking-widest">{data.invite.code}</span>
          </div>
        )}
        <button
          onClick={handleCopyInvite}
          className="w-full duck-btn-soft flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> {data.invite.code ? 'Copy invite' : 'Generate invite code'}
            </>
          )}
        </button>
        {data.invite.partnerJoined && (
          <p className="text-[10px] text-green-500 text-center mt-2 font-medium">
            ✓ Both partners connected
          </p>
        )}
      </motion.div>

      {/* Log Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={logOut}
          className="w-full flex items-center justify-center gap-2 text-sm text-amber-400 hover:text-red-400 transition-colors py-3"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </motion.div>
    </div>
  );
}

function ProfileCard({
  profile, resolvedDisplayName, partnerNicknameForMe, index, isOwn, onUpdate,
}: {
  profile: UserProfile;
  resolvedDisplayName: string;
  partnerNicknameForMe?: string;
  index: number;
  isOwn: boolean;
  onUpdate: (updates: Partial<UserProfile>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [email, setEmail] = useState(profile.email);
  const [birthDate, setBirthDate] = useState(profile.birthDate?.split('T')[0] || '');
  const fileRef = useRef<HTMLInputElement>(null);

  const usePartner = profile.usePartnerNickname !== false;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onUpdate({
      name: name.trim() || profile.name,
      displayName: displayName.trim() || undefined,
      email: email.trim(),
      birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
    });
    setEditing(false);
  };

  const gradient = isOwn
    ? 'from-amber-50 to-yellow-50 border-amber-200'
    : 'from-green-50 to-emerald-50 border-emerald-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn('bg-gradient-to-br rounded-3xl p-5 border', gradient)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {isOwn ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/60 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-amber-300" />
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-medium">Edit</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </button>
        ) : (
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/60 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-emerald-300" />
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-amber-800">{resolvedDisplayName}</h3>
            {isOwn && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-600">
                🐥 You
              </span>
            )}
          </div>
          {resolvedDisplayName !== profile.name && (
            <p className="text-[10px] text-amber-500/40 -mt-0.5 mb-1">{profile.name}</p>
          )}

          {!editing && isOwn ? (
            <div className="space-y-1">
              {profile.email && (
                <p className="text-xs text-amber-600/50 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {profile.email}
                </p>
              )}
              {profile.birthDate && (
                <p className="text-xs text-amber-600/50 flex items-center gap-1">
                  <Cake className="w-3 h-3" /> {formatDate(profile.birthDate)}
                </p>
              )}
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] text-amber-500 hover:text-amber-600 font-medium mt-1"
              >
                Edit profile
              </button>

              {/* Name preference toggle — only show if partner gave a nickname */}
              {partnerNicknameForMe && (
                <div className="mt-2 pt-2 border-t border-amber-200/50">
                  <p className="text-[10px] text-amber-600/50 mb-1.5">Display name preference</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onUpdate({ usePartnerNickname: true })}
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all',
                        usePartner
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                      )}
                    >
                      Partner&apos;s name: {partnerNicknameForMe}
                    </button>
                    <button
                      onClick={() => onUpdate({ usePartnerNickname: false })}
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all',
                        !usePartner
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                      )}
                    >
                      My name: {profile.displayName || profile.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !editing ? (
            <div className="space-y-1">
              {profile.email && (
                <p className="text-xs text-emerald-600/50 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {profile.email}
                </p>
              )}
              {profile.birthDate && (
                <p className="text-xs text-emerald-600/50 flex items-center gap-1">
                  <Cake className="w-3 h-3" /> {formatDate(profile.birthDate)}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              <div>
                <label className="text-[10px] text-amber-500/60 mb-0.5 block">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full duck-input"
                />
              </div>
              <div>
                <label className="text-[10px] text-amber-500/60 mb-0.5 block">Display name (optional)</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={profile.name}
                  className="w-full duck-input"
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full duck-input"
              />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full duck-input"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-xs duck-btn px-4 py-1.5"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs bg-amber-100 text-amber-500 px-4 py-1.5 rounded-xl hover:bg-amber-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ---- Nickname Editor ---- */
function NicknameEditor({
  currentNickname, partnerName, onSave,
}: {
  currentNickname: string;
  partnerName: string;
  onSave: (nickname: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(currentNickname);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(nickname.trim());
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="duck-card p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-3.5 h-3.5 text-amber-500" />
        <h3 className="text-xs font-semibold text-amber-800">Nickname for {partnerName}</h3>
      </div>
      <p className="text-[10px] text-amber-600/40 mb-3">
        Give your partner a cute nickname — this is how they&apos;ll appear throughout the app (if they allow it).
      </p>

      {!editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
            <p className="text-sm text-amber-800">
              {currentNickname || <span className="text-amber-400 italic">No nickname yet</span>}
            </p>
          </div>
          <button
            onClick={() => { setNickname(currentNickname); setEditing(true); }}
            className="duck-btn-soft flex items-center gap-1 text-xs px-3 py-2 rounded-xl"
          >
            <Pencil className="w-3 h-3" />
            {currentNickname ? 'Edit' : 'Set'}
          </button>
          {saved && (
            <span className="text-[10px] text-green-500 font-medium flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={`e.g. Honey, ${partnerName}ie, Babe...`}
            autoFocus
            className="flex-1 duck-input"
          />
          <button
            onClick={handleSave}
            className="text-xs duck-btn px-3 py-2"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-xs bg-amber-100 text-amber-500 px-3 py-2 rounded-xl hover:bg-amber-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}