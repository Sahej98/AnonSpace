import React from 'react';
import { Ghost, Cat, Dog, Bird, Rabbit } from 'lucide-react';

const ICONS = [
  (props) => <Ghost {...props} />,
  (props) => <Cat {...props} />,
  (props) => <Dog {...props} />,
  (props) => <Bird {...props} />,
  (props) => <Rabbit {...props} />,
];

const getIconIndex = (name) => {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % ICONS.length;
};

const UserAvatar = ({ alias, size = 'md' }) => {
  const name = alias?.name;
  const sizeClass = size === 'sm' ? 'sm' : 'md';

  if (!alias || !name) {
    return <div className={`avatar-wrapper ${sizeClass}`} />;
  }

  const Icon = ICONS[getIconIndex(name)];

  return (
    <div className={`avatar-wrapper ${sizeClass}`} title={name}>
      <Icon size={size === 'sm' ? 16 : 20} />
    </div>
  );
};

export default UserAvatar;
