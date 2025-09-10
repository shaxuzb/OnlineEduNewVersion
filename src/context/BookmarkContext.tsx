import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkedLesson } from '../types';

interface BookmarkContextType {
  bookmarkedLessons: BookmarkedLesson[];
  isLoading: boolean;
  addBookmark: (lesson: BookmarkedLesson) => Promise<void>;
  removeBookmark: (lessonId: number, courseType: string) => Promise<void>;
  isBookmarked: (lessonId: number, courseType: string) => boolean;
  getBookmarksByCategory: () => { [key: string]: BookmarkedLesson[] };
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

interface BookmarkProviderProps {
  children: ReactNode;
}

const BOOKMARKS_STORAGE_KEY = 'bookmarked_lessons';

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarkedLessons, setBookmarkedLessons] = useState<BookmarkedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks on app start
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookmarkedLessons(parsed);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBookmarks = async (bookmarks: BookmarkedLesson[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const addBookmark = async (lesson: BookmarkedLesson) => {
    try {
      const updatedBookmarks = [...bookmarkedLessons, lesson];
      setBookmarkedLessons(updatedBookmarks);
      await saveBookmarks(updatedBookmarks);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const removeBookmark = async (lessonId: number, courseType: string) => {
    try {
      const updatedBookmarks = bookmarkedLessons.filter(
        bookmark => !(bookmark.id === lessonId && bookmark.courseType === courseType)
      );
      setBookmarkedLessons(updatedBookmarks);
      await saveBookmarks(updatedBookmarks);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const isBookmarked = (lessonId: number, courseType: string): boolean => {
    return bookmarkedLessons.some(
      bookmark => bookmark.id === lessonId && bookmark.courseType === courseType
    );
  };

  const getBookmarksByCategory = (): { [key: string]: BookmarkedLesson[] } => {
    const categorized: { [key: string]: BookmarkedLesson[] } = {};
    
    bookmarkedLessons.forEach(bookmark => {
      const categoryName = bookmark.courseName;
      if (!categorized[categoryName]) {
        categorized[categoryName] = [];
      }
      categorized[categoryName].push(bookmark);
    });

    // Sort each category by bookmarked date (newest first)
    Object.keys(categorized).forEach(key => {
      categorized[key].sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());
    });

    return categorized;
  };

  const value: BookmarkContextType = {
    bookmarkedLessons,
    isLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarksByCategory,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmark = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};
