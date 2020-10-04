import * as React from "react";

type FnCmp = ({ close }: { close: () => void }) => JSX.Element;
type SetActive = React.Dispatch<React.SetStateAction<boolean>>;
type StatePair = [boolean, SetActive];
type Overlay = [FnCmp, boolean, SetActive];
interface ProviderProps {
  children?: React.ReactNode;
}

const OverlayContext = React.createContext({
  createOverlay: (
    Cmp: FnCmp,
    initActive: boolean,
    setActive: SetActive
  ): void => undefined,
  updateOverlay: (Cmp: FnCmp, active: boolean): void => undefined,
  removeOverlay: (Cmp: FnCmp): void => undefined
});

export const OverlayProvider = (props: ProviderProps): JSX.Element => {
  const { children } = props;
  const [overlays, setOverlays] = React.useState<Overlay[]>([]);
  const createOverlay = (
    Cmp: FnCmp,
    initActive: boolean,
    setActive: SetActive
  ) => {
    setOverlays((overlays) => [...overlays, [Cmp, initActive, setActive]]);
  };
  const removeOverlay = (Cmp: FnCmp) => {
    setOverlays((overlays) => overlays.filter(([C]) => C !== Cmp));
  };
  const updateOverlay = (Cmp: FnCmp, active: boolean) => {
    setOverlays((overlays) =>
      overlays.map(([C, ac, s]) => (C === Cmp ? [C, active, s] : [C, ac, s]))
    );
  };

  return (
    <OverlayContext.Provider
      value={{ createOverlay, removeOverlay, updateOverlay }}
    >
      {children}
      {overlays.map(([Cmp, active, setActive], idx) => {
        return active ? (
          <React.Fragment key={idx}>
            <Cmp close={() => setActive(false)} />
          </React.Fragment>
        ) : null;
      })}
    </OverlayContext.Provider>
  );
};

export const useOverlay = (Cmp: FnCmp, initState = false): StatePair => {
  const [active, setActive] = React.useState(initState);
  const overlayContext = React.useContext(OverlayContext);

  React.useEffect(() => {
    overlayContext.createOverlay(Cmp, initState, setActive);

    return () => {
      overlayContext.removeOverlay(Cmp);
    };
  }, []);

  React.useEffect(() => {
    overlayContext.updateOverlay(Cmp, active);
  }, [active]);

  return [active, setActive];
};
