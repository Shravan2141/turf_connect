export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-6 px-4 md:px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Pavallion Sports Arena. All rights reserved.</p>
      </div>
    </footer>
  );
}
