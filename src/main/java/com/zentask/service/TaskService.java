package com.zentask.service;

import com.zentask.entity.Task;
import com.zentask.entity.User;
import com.zentask.repository.TaskRepository;
import com.zentask.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public List<Task> getTasksForUser(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return taskRepository.findByUser(user);
    }

    public Task createTask(Task task, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        task.setUser(user);
        if (task.getSubTasks() != null) {
            task.getSubTasks().forEach(st -> st.setTask(task));
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails, String username) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getUser().getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setCategory(taskDetails.getCategory());
        task.setDueDate(taskDetails.getDueDate());
        
        // Update subtasks
        task.getSubTasks().clear();
        if (taskDetails.getSubTasks() != null) {
            taskDetails.getSubTasks().forEach(st -> {
                st.setTask(task);
                task.getSubTasks().add(st);
            });
        }
        
        return taskRepository.save(task);
    }

    public void deleteTask(Long id, String username) {
        Task task = taskRepository.findById(id).orElseThrow();
        if (!task.getUser().getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        taskRepository.delete(task);
    }
}