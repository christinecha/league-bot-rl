import React from 'react'
import COLORS from '../../shared/COLORS'
import { css } from '@emotion/css'

export const DiscordUser = ({
  userId,
  data: user = {},
  onClick,
  isSelected,
}) => {
  const imgSrc = user.avatarURL || ''

  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        color: ${isSelected ? COLORS.GREEN : 'inherit'};
        cursor: pointer;
        font-size: 14px;

        &:hover {
          color: ${onClick ? COLORS.GREEN : 'inherit'};
        }
      `}
      onClick={onClick}
    >
      <img
        src={imgSrc}
        alt={`Avatar for user ${user.username || userId}`}
        className={css`
          width: 20px;
          margin-right: 5px;
          border-radius: 100%;
          display: ${imgSrc ? 'inline' : 'none'};
        `}
      />
      {user.username || userId}
      {/* {rank && rank.name} */}
    </div>
  )
}
