package by.itransition.webconstructor.service;

import by.itransition.webconstructor.domain.*;
import by.itransition.webconstructor.dto.ElementDto;
import by.itransition.webconstructor.dto.PageDto;
import by.itransition.webconstructor.error.ResourceNotFoundException;
import by.itransition.webconstructor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PageServiceImpl implements PageService{

    private static final int MAX_LENGTH = 255;
    @Autowired
    PageRepository pageRepository;

    @Autowired
    SiteRepository siteRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ElementsRepository elementsRepository;

    @Override
    public Page getPage(Long id) {
        Page page = pageRepository.findOne(id);
        if (page == null) {
            throw new ResourceNotFoundException();
        }
        return page;
    }

    @Override
    public Page getUserPage(Long id, String username, String siteName) {
        Page page = pageRepository.findOne(id);
        Site site = siteRepository.findByUserAndNameAllIgnoringCase(userRepository.findByUsername(username), siteName);
        if (site == null || page == null || !site.getPages().contains(page)) {
            throw new ResourceNotFoundException();
        }
        return page;
    }

    @Override
    public List<Element> getElements(Long id) {
        return elementsRepository.findByPageOrderByIdAsc(pageRepository.findOne(id));
    }

    @Override
    public long create(Long siteId) {
        Page page = new Page();
        page.setSite(siteRepository.findOne(siteId));
        return pageRepository.save(page).getId();
    }

    @Override
    public void update(Long id, PageDto pageDto) {
        Page page = pageRepository.findOne(id);
        page.setLayoutId(pageDto.getLayout());
        page.setName(checkName(pageDto.getName()));
        ElementDto[] elementDtos = pageDto.getElements();
        page.clearElements();
        for (ElementDto dto : elementDtos) {
            Element element = new Element();
            element.setLocation(dto.getLocation());
            element.setType(Type.valueOf(dto.getType().toUpperCase()));
            element.setPage(page);
            element.setWidth(dto.getWidth());
            element.setHeight(dto.getHeight());
            element.setUrl(dto.getUrl());
            element.setText(dto.getText());
            element.setAutoplay(dto.isAutoplay());
            element.setVideoLoop(dto.isLoop());
            element.setChart(dto.isChart());
            page.addElement(element);
        }
        pageRepository.save(page);
    }

    private String checkName(String name) {
        return name.length() > MAX_LENGTH ? name.substring(0, MAX_LENGTH - 1) : name;
    }

    @Override
    public void delete(Long id) {
        pageRepository.delete(id);
    }
}
