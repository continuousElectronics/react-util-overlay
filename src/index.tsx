import * as React from "react";

export type CmpProps = Record<string, any>;
type FnCmp = (componentProps: any) => JSX.Element;
type SetActive = React.Dispatch<React.SetStateAction<boolean>>;
type StatePair = [boolean, SetActive];
type Overlay = [FnCmp, boolean, SetActive, CmpProps];
interface ProviderProps {
  children?: React.ReactNode;
}

const OverlayContext = React.createContext({
  createOverlay: (
    Cmp: FnCmp,
    initActive: boolean,
    setActive: SetActive,
    cmpProps: CmpProps
  ): void => undefined,
  updateOverlay: (Cmp: FnCmp, active: boolean, cmpProps: CmpProps): void =>
    undefined,
  removeOverlay: (Cmp: FnCmp): void => undefined
});

export const OverlayProvider = (props: ProviderProps): JSX.Element => {
  const { children } = props;
  const [overlays, setOverlays] = React.useState<Overlay[]>([]);
  const createOverlay = (
    Cmp: FnCmp,
    initActive: boolean,
    setActive: SetActive,
    cmpProps: CmpProps
  ) => {
    setOverlays((overlays) => [
      ...overlays,
      [Cmp, initActive, setActive, cmpProps]
    ]);
  };
  const removeOverlay = (Cmp: FnCmp) => {
    setOverlays((overlays) => overlays.filter(([C]) => C !== Cmp));
  };
  const updateOverlay = (Cmp: FnCmp, active: boolean, cmpProps: CmpProps) => {
    setOverlays((overlays) =>
      overlays.map(([C, ac, s]) =>
        C === Cmp ? [C, active, s, cmpProps] : [C, ac, s, cmpProps]
      )
    );
  };

  return (
    <OverlayContext.Provider
      value={{ createOverlay, removeOverlay, updateOverlay }}
    >
      {children}
      {overlays.map(([Cmp, active, setActive, cmpProps], idx) => {
        return active ? (
          <React.Fragment key={idx}>
            <Cmp close={() => setActive(false)} {...cmpProps} />
          </React.Fragment>
        ) : null;
      })}
    </OverlayContext.Provider>
  );
};

export const createOverlay = (Cmp: FnCmp) => {
  return (cmpProps: CmpProps = {}, initState = false): StatePair => {
    const [active, setActive] = React.useState(initState);
    const overlayContext = React.useContext(OverlayContext);

    React.useEffect(() => {
      overlayContext.createOverlay(Cmp, initState, setActive, cmpProps);

      return () => {
        overlayContext.removeOverlay(Cmp);
      };
    }, []);

    React.useEffect(() => {
      overlayContext.updateOverlay(Cmp, active, cmpProps);
    }, [active, JSON.stringify(cmpProps)]);

    return [active, setActive];
  };
};
