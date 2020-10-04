# React Utils - Overlay

Create overlays with the state controlled by any component embedded at any level as long as it is inside the provider. This allows you to not fight z-index issues by having elements adjacent to your outermost main content element, while still being able to control the state inside any component by using the provided hook.

## Example Usage

### The outermost element you want the overlays appended to

```javascript
import Header from "components/Header";
import Footer from "components/Footer";
import { OverlayProvider } from "@react-util/overlay";

const Layout = ({ children }) => {
  return (
    <OverlayProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* The overlays you create with the hook will all be created here
      // they can be controlled by hooks from any component inside the provider */}
    </OverlayProvider>
  );
};

export default Layout;
```

### Any component inside the provider

```javascript
// react-remove-scroll is nice to use if you would like to remove the scroll on the overlay
import { RemoveScroll } from "react-remove-scroll";
// use the hook to control the state
import { useOverlay } from "@react-util/overlay";

// your component will be called with the prop "close" which is a function that closes the overlay
// opening the overlay puts it in the virtual dom, closing it removes it from the virtual dom
// for transitions / animations you can use css animations in conjuntion with onAnimationEnd calling close()
const Overlay = ({ close }) => {
  return (
    // Note: RemoveScroll is optional. It is nice to lock scroll on an overlay, but not required.
    // This library only takes care of placing / removing the overlay in the virtual dom, nothing else.
    <RemoveScroll className="byo-styles">
      <button onClick={() => close()}>close overlay</button>
    </RemoveScroll>
  );
};

const SubComponent = ({ children }) => {
  // first argument is the component
  // section optional argument is intitial active state of overlay defaulting to false
  const [active, setActive] = useOverlay(Overlay);

  return (
    <section>
      <div>the popup is {active ? "" : "not"} active</div>
      <button onClick={() => setActive(true)}>open overlay</button>
    </sectopm>
  );
};

export default SubComponent;
```
