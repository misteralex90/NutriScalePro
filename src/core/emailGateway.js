export const sendEmail = ({ state, to, subject, body }) => {
  return {
    ...state,
    emailOutbox: [
      ...(state.emailOutbox ?? []),
      { to, subject, body, sentAt: new Date().toISOString() },
    ],
  };
};
