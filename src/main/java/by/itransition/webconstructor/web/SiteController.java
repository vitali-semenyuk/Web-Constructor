package by.itransition.webconstructor.web;

import by.itransition.webconstructor.domain.Site;
import by.itransition.webconstructor.domain.User;
import by.itransition.webconstructor.dto.SiteDto;
import by.itransition.webconstructor.service.SiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/sites")
public class SiteController {

    @Autowired
    SiteService siteService;

    @GetMapping
    public String index(Model model) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Site> sites = siteService.getSites(user);
        model.addAttribute("sites", sites);
        model.addAttribute("rates", siteService.getSitesRates(sites));
        return "sites/list";
    }

    @PostMapping("/create")
    public
    @ResponseBody
    String create(Model model) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return String.valueOf(siteService.create(user));
    }

    @GetMapping("/{site}")
    public String edit(@PathVariable("site") Long id, Model model) {
        Site site = siteService.getSite(id);
        model.addAttribute("site", site);
        model.addAttribute("siteDto", new SiteDto(site));
        return "sites/site";
    }

    @PostMapping("/{site}")
    public String update(@PathVariable("site") Long id, @ModelAttribute("siteDto") SiteDto site, Model model) {
        siteService.update(id, site);
        return "redirect:/sites";
    }

    @DeleteMapping("/{site}")
    public
    @ResponseBody
    String remove(@PathVariable("site") Long id, Model model) {
        siteService.delete(id);
        return "";
    }

}