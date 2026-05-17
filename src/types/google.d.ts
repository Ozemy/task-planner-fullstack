interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme: 'outline';
            size: 'large';
            width: number;
            text: 'continue_with';
          },
        ) => void;
      };
    };
  };
}
