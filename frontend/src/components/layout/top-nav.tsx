import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Search, Sun } from "lucide-react";
import { getGlobalSearchSuggestions } from "@/services/census.service";
import { useAuth } from "@/context/auth-context";
import { useThemeMode } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

type SearchResult = {
  id: string;
  type: string;
  label: string;
  meta: string;
};

export function TopNav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeMode();
  const { logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data = [], isFetching } = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => getGlobalSearchSuggestions(query),
    enabled: query.trim().length > 1,
  });

  const grouped = useMemo(
    () => ({
      family: data.filter((item) => item.type === "Family"),
      member: data.filter((item) => item.type === "Member"),
      village: data.filter((item) => item.type === "Village"),
    }),
    [data],
  );

  const hasSearchText = query.trim().length > 1;
  const showSearchResults = searchFocused && hasSearchText;

  const openSuggestion = (item: SearchResult) => {
    setQuery("");
    setSearchFocused(false);

    if (item.type === "Family") {
      void navigate({ to: "/population/families/$familyId", params: { familyId: item.id } });
      return;
    }

    if (item.type === "Member") {
      void navigate({ to: "/population/members/$memberId/edit", params: { memberId: item.id } });
      return;
    }

    void navigate({ to: "/population/villages/$villageId", params: { villageId: item.id } });
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && data.length > 0) {
      event.preventDefault();
      openSuggestion(data[0]);
    }
  };

  return (
    <header className="sticky top-0 z-10 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border bg-card/85 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
      <SidebarTrigger className="shrink-0" />

      <div className="relative w-full max-w-xl">
        <div className="flex h-11 items-center gap-2 rounded-full border border-input bg-background/70 px-4 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-ring">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
            onKeyDown={handleSearchKeyDown}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search villages, families, members..."
            aria-label="Search villages, families, members"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Ctrl K
          </kbd>
        </div>

        {showSearchResults ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
            {isFetching ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">Searching...</p>
            ) : data.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No matches found.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto py-2">
                <SearchGroup title="Villages" items={grouped.village} onSelect={openSuggestion} />
                <SearchGroup title="Families" items={grouped.family} onSelect={openSuggestion} />
                <SearchGroup title="Members" items={grouped.member} onSelect={openSuggestion} />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full bg-background/70"
        onClick={() => {
          logout();
          void navigate({ to: "/" });
        }}
        aria-label="Logout"
      >
        <LogOut className="size-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full bg-background/70"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </header>
  );
}

function SearchGroup({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: SearchResult[];
  onSelect: (item: SearchResult) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="py-1">
      <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {items.map((item) => (
        <button
          key={`${item.type}-${item.id}`}
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
        >
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.label}</span>
            {item.meta ? (
              <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
            ) : null}
          </span>
          <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.type}
          </span>
        </button>
      ))}
    </div>
  );
}
